const video = document.getElementById("camera");
const captureBtn = document.getElementById("captureBtn");
const createStripBtn = document.getElementById("createStripBtn");

const thumbs = document.querySelectorAll(".thumb");
const wrappers = document.querySelectorAll(".thumb-wrapper");
const removes = document.querySelectorAll(".remove");

let fotosTomadas = [];
let currentIndex = 0;

/* 🎥 Cámara */
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream);

/* 📸 Flash */
function flashEffect() {
  const flash = document.createElement("div");
  flash.className = "flash";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 300);
}

/* 📷 Capturar foto */
captureBtn.addEventListener("click", () => {
  if (currentIndex >= 4) return;

  const canvas = thumbs[currentIndex];
  const ctx = canvas.getContext("2d");

  canvas.width = 300;
  canvas.height = 300;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 📌 Guardar foto comprimida
  const dataURL = canvas.toDataURL("image/jpeg", 0.8);
  fotosTomadas[currentIndex] = dataURL;

  wrappers[currentIndex]
    .querySelector(".remove")
    .style.display = "block";

  flashEffect();
  currentIndex++;

  if (currentIndex === 4) {
    captureBtn.disabled = true;
    createStripBtn.disabled = false;
  }
});

/* ❌ Eliminar foto */
removes.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const canvas = thumbs[index];
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    btn.style.display = "none";

    fotosTomadas[index] = null;

    currentIndex = index;
    captureBtn.disabled = false;
    createStripBtn.disabled = true;
  });
});

/* 🎞️ Crear photostrip */
createStripBtn.addEventListener("click", () => {
  const fotosFinales = fotosTomadas.filter(foto => foto !== null);

  // 🔥 LIMPIAR Y GUARDAR
  localStorage.removeItem("photostripFotos");
  localStorage.setItem(
    "photostripFotos",
    JSON.stringify(fotosFinales)
  );

  window.location.href = "personalizacion.html";
});
