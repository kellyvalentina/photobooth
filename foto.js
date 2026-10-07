const video = document.getElementById("camera");
const captureBtn = document.getElementById("captureBtn");
const createStripBtn = document.getElementById("createStripBtn");
const countdownEl = document.getElementById("countdown");
const cameraError = document.getElementById("cameraError");

const thumbs = document.querySelectorAll(".thumb");
const removes = document.querySelectorAll(".remove");

const TAMANO = 600; // resolución de cada foto (cuadrada)
const fotos = [null, null, null, null];

/* 🎥 Cámara frontal */
async function iniciarCamara() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    actualizarBotones();
  } catch (err) {
    console.error(err);
    cameraError.hidden = false;
  }
}
iniciarCamara();

/* 📸 Flash */
function flashEffect() {
  const flash = document.createElement("div");
  flash.className = "flash";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 300);
}

/* ⏱️ Cuenta regresiva 3-2-1 */
function cuentaRegresiva(segundos) {
  return new Promise(resolve => {
    countdownEl.hidden = false;
    let n = segundos;
    countdownEl.textContent = n;
    const timer = setInterval(() => {
      n--;
      if (n === 0) {
        clearInterval(timer);
        countdownEl.hidden = true;
        resolve();
      } else {
        countdownEl.textContent = n;
      }
    }, 1000);
  });
}

/* Recorta el centro del video en un cuadrado (sin estirar) y lo voltea como espejo */
function capturarCuadro() {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const lado = Math.min(vw, vh);
  const sx = (vw - lado) / 2;
  const sy = (vh - lado) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = TAMANO;
  canvas.height = TAMANO;
  const ctx = canvas.getContext("2d");
  ctx.translate(TAMANO, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, lado, lado, 0, 0, TAMANO, TAMANO);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function pintarMiniatura(i) {
  const canvas = thumbs[i];
  const ctx = canvas.getContext("2d");
  canvas.width = 168;
  canvas.height = 168;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  removes[i].classList.toggle("visible", !!fotos[i]);
  if (!fotos[i]) return;
  const img = new Image();
  img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.src = fotos[i];
}

function actualizarBotones() {
  const llenas = fotos.filter(Boolean).length;
  captureBtn.disabled = llenas === 4 || !video.srcObject;
  createStripBtn.disabled = llenas !== 4;
  captureBtn.textContent = llenas === 4 ? "¡Listo! ✨" : `📸 Tomar foto (${llenas + 1}/4)`;
}

/* 📷 Capturar en el primer espacio vacío */
captureBtn.addEventListener("click", async () => {
  const i = fotos.indexOf(null);
  if (i === -1) return;
  captureBtn.disabled = true;
  await cuentaRegresiva(3);
  fotos[i] = capturarCuadro();
  flashEffect();
  pintarMiniatura(i);
  actualizarBotones();
});

/* ❌ Repetir una foto */
removes.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    fotos[i] = null;
    pintarMiniatura(i);
    actualizarBotones();
  });
});

/* 🎞️ Crear photostrip */
createStripBtn.addEventListener("click", () => {
  try {
    localStorage.setItem("photostripFotos", JSON.stringify(fotos));
    localStorage.setItem("photostripOrigen", "foto.html");
    window.location.href = "personalizacion.html";
  } catch (e) {
    console.error(e);
    alert("No se pudieron guardar las fotos 😭 Intenta de nuevo.");
  }
});
