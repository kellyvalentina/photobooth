// --- Colores pastel ---
const pastelColors = ["#f9eaecff","#bbcae8ff","#ffffffff","#FFF3D6","#e2d6eeff","#c7c7c7ff"];

// --- Elementos DOM ---
const stripColorsContainer = document.getElementById("stripColors");
const frameColorsContainer = document.getElementById("frameColors");
const photoStrip = document.getElementById("photoStrip");
const downloadBtn = document.getElementById("downloadBtn");
const stickerOptions = document.getElementById("stickerOptions");

// --- Función para crear opciones de color ---
function createColorOptions(container, onSelect) {
  pastelColors.forEach(color => {
    const circle = document.createElement("div");
    circle.className = "color-circle";
    circle.style.backgroundColor = color;

    circle.addEventListener("click", () => {
      container.querySelectorAll(".color-circle").forEach(c => c.classList.remove("active"));
      circle.classList.add("active");
      onSelect(color);
    });

    container.appendChild(circle);
  });
}

// --- Aplicar color a fondo y marco ---
createColorOptions(stripColorsContainer, color => photoStrip.style.backgroundColor = color);
createColorOptions(frameColorsContainer, color => photoStrip.style.borderColor = color);

// --- Cargar fotos desde localStorage ---
const savedPhotosJSON = localStorage.getItem("photostripFotos");
if (savedPhotosJSON) {
  const savedPhotos = JSON.parse(savedPhotosJSON);
  savedPhotos.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.style.width = "100%"; // Ajusta al diseño de tu tira
    photoStrip.appendChild(img);
  });
}

// --- Lista de stickers ---
const stickerList = [
  "flores.webp",
  "fresita.webp",
  "moñito.webp",
  "osito cafe.webp",
  "osito rosa.webp"
];

// --- Crear miniaturas de stickers en el panel ---
stickerList.forEach(src => {
  const thumb = document.createElement("img");
  thumb.src = src;
  thumb.classList.add("sticker-thumb");
  stickerOptions.appendChild(thumb);

  // Al hacer click, agregar sticker a la tira
  thumb.addEventListener("click", () => {
    const clone = document.createElement("img");
    clone.src = src;
    clone.classList.add("draggable-sticker");
    clone.style.top = "10px";
    clone.style.left = "10px";
    photoStrip.appendChild(clone);
    makeDraggable(clone);
  });
});

// --- Función para arrastrar stickers ---
function makeDraggable(el) {
  let isDragging = false;
  let offsetX, offsetY;

  el.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    el.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    const rect = photoStrip.getBoundingClientRect();
    el.style.left = (e.clientX - rect.left - offsetX) + "px";
    el.style.top = (e.clientY - rect.top - offsetY) + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    el.style.cursor = "grab";
  });
}


downloadBtn.addEventListener("click", () => {


  const watermark = document.createElement("div");
  watermark.className = "watermark-sticker";
  watermark.innerText = "★ key's photobooth ★ ";
  photoStrip.appendChild(watermark);

  html2canvas(photoStrip).then(canvas => {
    const link = document.createElement("a");
    link.download = "photostrip.png";
    link.href = canvas.toDataURL();
    link.click();

    // ocultar marca de agua xd
    watermark.remove();
  });
});
function goBack() {
  window.history.back(); 
}