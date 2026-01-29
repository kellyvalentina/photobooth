document.addEventListener("DOMContentLoaded", () => {

  const fileInput = document.querySelector('input[type="file"]');
  const chooseBtn = document.querySelector(".choose-btn");
  const slots = document.querySelectorAll(".photo-slot");
  const createBtn = document.getElementById("createStripBtn");

  let uploadedImages = [];

  chooseBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);

    files.forEach(file => {
      if (uploadedImages.length >= 4) return;

      compressImage(file, (compressedBase64) => {
        uploadedImages.push(compressedBase64);
        renderImages();
      });
    });

    fileInput.value = "";
  });

  function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const MAX_SIZE = 600; // 🔥 CLAVE
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        callback(compressed);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function renderImages() {
    slots.forEach(slot => {
      slot.style.backgroundImage = "none";
      slot.classList.remove("filled");
    });

    uploadedImages.forEach((img, index) => {
      const slot = slots[index];
      slot.style.backgroundImage = `url(${img})`;
      slot.style.backgroundSize = "cover";
      slot.style.backgroundPosition = "center";
      slot.classList.add("filled");
    });

    createBtn.disabled = uploadedImages.length !== 4;
  }

  slots.forEach((slot, index) => {
    const removeBtn = slot.querySelector(".remove-btn");

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      uploadedImages.splice(index, 1);
      renderImages();
    });
  });

  createBtn.addEventListener("click", () => {
    try {
     // Limpiar fotos anteriores
localStorage.removeItem("photostripFotos");

// Guardar las fotos subidas como las activas
localStorage.setItem(
  "photostripFotos",
  JSON.stringify(uploadedImages)
);

// Ir a personalización
window.location.href = "personalizacion.html";

    } catch (e) {
      alert("Las imágenes son demasiado pesadas 😭");
      console.error(e);
    }
  });

});

