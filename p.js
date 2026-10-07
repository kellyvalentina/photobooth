// =========================================
// Personalización del photostrip #TeamSistemas
// =========================================

// Texto que acompaña la foto al compartir (puedes agregar el @ de la U aquí)
const MENSAJE_COMPARTIR = "#TeamSistemas 💜✨";
const NOMBRE_ARCHIVO = "teamsistemas-photostrip.png";
const ESCALA_EXPORT = 3; // resolución de la imagen final (3x la vista previa)

const coloresPastel = ["#ffffff", "#f9eaec", "#e2d6ee", "#bbcae8", "#fff3d6", "#c9b6ec", "#43386a"];

const stickers = [
  "stickers/mike.webp",
  "stickers/corona.svg",
  "stickers/laptop.svg",
  "stickers/codigo.svg",
  "stickers/corazon.svg",
  "stickers/estrella.svg",
  "flores.webp",
  "fresita.webp",
  "moñito.webp",
  "osito cafe.webp",
  "osito rosa.webp"
];

// --- DOM ---
const photoStrip = document.getElementById("photoStrip");
const fotosEl = document.getElementById("fotos");
const stripColors = document.getElementById("stripColors");
const frameColors = document.getElementById("frameColors");
const stickerOptions = document.getElementById("stickerOptions");
const removeStickerBtn = document.getElementById("removeStickerBtn");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");
const backBtn = document.getElementById("backBtn");

// --- Volver a donde vino (cámara o subir) ---
backBtn.addEventListener("click", () => {
  window.location.href = localStorage.getItem("photostripOrigen") || "index.html";
});

// --- Fotos guardadas ---
const fotosGuardadas = JSON.parse(localStorage.getItem("photostripFotos") || "[]").filter(Boolean);
if (fotosGuardadas.length === 0) {
  window.location.href = "index.html";
}
fotosGuardadas.forEach(src => {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  fotosEl.appendChild(img);
});

// --- Colores ---
function crearColores(contenedor, inicial, alElegir) {
  coloresPastel.forEach(color => {
    const circulo = document.createElement("button");
    circulo.className = "color-circle";
    circulo.style.backgroundColor = color;
    circulo.setAttribute("aria-label", `Color ${color}`);
    if (color === inicial) circulo.classList.add("active");
    circulo.addEventListener("click", () => {
      contenedor.querySelectorAll(".color-circle").forEach(c => c.classList.remove("active"));
      circulo.classList.add("active");
      alElegir(color);
    });
    contenedor.appendChild(circulo);
  });
}
crearColores(stripColors, "#ffffff", color => {
  photoStrip.style.backgroundColor = color;
  // Si el fondo es oscuro, el texto del pie se vuelve claro
  const claro = color === "#43386a";
  photoStrip.querySelector(".strip-hashtag").style.color = claro ? "#ffffff" : "";
  photoStrip.querySelector(".strip-sub").style.color = claro ? "#e2d6ee" : "";
});
crearColores(frameColors, "#e2d6ee", color => (photoStrip.style.borderColor = color));

// --- Stickers ---
let seleccionado = null;

function seleccionar(el) {
  if (seleccionado) seleccionado.classList.remove("seleccionado");
  seleccionado = el;
  if (el) el.classList.add("seleccionado");
  removeStickerBtn.disabled = !el;
}

stickers.forEach(src => {
  const thumb = document.createElement("img");
  thumb.src = encodeURI(src);
  thumb.alt = "sticker";
  thumb.className = "sticker-thumb";
  stickerOptions.appendChild(thumb);

  thumb.addEventListener("click", () => {
    const sticker = document.createElement("img");
    sticker.src = encodeURI(src);
    sticker.alt = "";
    sticker.className = "draggable-sticker";
    sticker.draggable = false;
    // aparece en un lugar distinto cada vez para no quedar encimados
    const max = photoStrip.clientWidth - 64;
    sticker.style.left = Math.round(Math.random() * max) + "px";
    sticker.style.top = Math.round(20 + Math.random() * (photoStrip.clientHeight * 0.6)) + "px";
    photoStrip.appendChild(sticker);
    hacerArrastrable(sticker);
    seleccionar(sticker);
  });
});

removeStickerBtn.addEventListener("click", () => {
  if (!seleccionado) return;
  seleccionado.remove();
  seleccionar(null);
});

// Arrastrar con mouse o dedo (pointer events)
function hacerArrastrable(el) {
  let offsetX = 0;
  let offsetY = 0;

  el.addEventListener("pointerdown", e => {
    e.preventDefault();
    seleccionar(el);
    el.setPointerCapture(e.pointerId);
    el.classList.add("arrastrando");
    const r = el.getBoundingClientRect();
    offsetX = e.clientX - r.left;
    offsetY = e.clientY - r.top;
  });

  el.addEventListener("pointermove", e => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    const strip = photoStrip.getBoundingClientRect();
    const borde = photoStrip.clientLeft; // grosor del marco
    const maxX = photoStrip.clientWidth - el.offsetWidth / 2;
    const maxY = photoStrip.clientHeight - el.offsetHeight / 2;
    let x = e.clientX - strip.left - borde - offsetX;
    let y = e.clientY - strip.top - borde - offsetY;
    x = Math.max(-el.offsetWidth / 2, Math.min(maxX, x));
    y = Math.max(-el.offsetHeight / 2, Math.min(maxY, y));
    el.style.left = x + "px";
    el.style.top = y + "px";
  });

  const soltar = e => {
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    el.classList.remove("arrastrando");
  };
  el.addEventListener("pointerup", soltar);
  el.addEventListener("pointercancel", soltar);
}

// =========================================
// Exportar: dibuja la tira en un canvas
// (más nítido y confiable que capturar el HTML)
// =========================================
function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function rectRelativo(el, base) {
  const r = el.getBoundingClientRect();
  return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
}

function rectRedondeado(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function generarImagen() {
  seleccionar(null);
  await document.fonts.ready;

  const base = photoStrip.getBoundingClientRect();
  const estilo = getComputedStyle(photoStrip);
  const radio = parseFloat(estilo.borderTopLeftRadius) || 0;
  const borde = parseFloat(estilo.borderTopWidth) || 0;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(base.width * ESCALA_EXPORT);
  canvas.height = Math.round(base.height * ESCALA_EXPORT);
  const ctx = canvas.getContext("2d");
  ctx.scale(ESCALA_EXPORT, ESCALA_EXPORT);

  // Marco + fondo
  rectRedondeado(ctx, 0, 0, base.width, base.height, radio);
  ctx.fillStyle = estilo.borderTopColor;
  ctx.fill();
  rectRedondeado(ctx, borde, borde, base.width - borde * 2, base.height - borde * 2, Math.max(0, radio - borde));
  ctx.fillStyle = estilo.backgroundColor;
  ctx.fill();

  // Fotos
  for (const img of fotosEl.querySelectorAll("img")) {
    const r = rectRelativo(img, base);
    ctx.save();
    rectRedondeado(ctx, r.x, r.y, r.w, r.h, parseFloat(getComputedStyle(img).borderTopLeftRadius) || 0);
    ctx.clip();
    ctx.drawImage(img, r.x, r.y, r.w, r.h);
    ctx.restore();
  }

  // Texto #TeamSistemas
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const el of photoStrip.querySelectorAll(".strip-hashtag, .strip-sub")) {
    const r = rectRelativo(el, base);
    const s = getComputedStyle(el);
    ctx.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
    ctx.fillStyle = s.color;
    ctx.fillText(el.textContent, r.x + r.w / 2, r.y + r.h / 2);
  }

  // Stickers (encima de todo, recortados al borde de la tira)
  ctx.save();
  rectRedondeado(ctx, 0, 0, base.width, base.height, radio);
  ctx.clip();
  for (const el of photoStrip.querySelectorAll(".draggable-sticker")) {
    const r = rectRelativo(el, base);
    const img = await cargarImagen(el.src);
    // mantener proporción dentro de su caja (como object-fit: contain)
    const escala = Math.min(r.w / img.naturalWidth, r.h / img.naturalHeight);
    const w = img.naturalWidth * escala;
    const h = img.naturalHeight * escala;
    ctx.drawImage(img, r.x + (r.w - w) / 2, r.y + (r.h - h) / 2, w, h);
  }
  ctx.restore();

  return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
}

function descargar(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = NOMBRE_ARCHIVO;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function conBotonOcupado(btn, texto, accion) {
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = texto;
  try {
    await accion();
  } catch (e) {
    if (e && e.name !== "AbortError") {
      console.error(e);
      alert("Algo salió mal al crear la imagen 😭 Intenta de nuevo.");
    }
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

downloadBtn.addEventListener("click", () =>
  conBotonOcupado(downloadBtn, "Creando…", async () => descargar(await generarImagen()))
);

// Compartir directo a Instagram / WhatsApp (si el celular lo permite)
const pruebaArchivo = new File([""], NOMBRE_ARCHIVO, { type: "image/png" });
if (navigator.canShare && navigator.canShare({ files: [pruebaArchivo] })) {
  shareBtn.hidden = false;
  shareBtn.addEventListener("click", () =>
    conBotonOcupado(shareBtn, "Preparando…", async () => {
      const blob = await generarImagen();
      const archivo = new File([blob], NOMBRE_ARCHIVO, { type: "image/png" });
      await navigator.share({ files: [archivo], text: MENSAJE_COMPARTIR });
    })
  );
}
