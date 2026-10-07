document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.querySelector('input[type="file"]');
  const dropZone = document.getElementById("dropZone");
  const slots = document.querySelectorAll(".photo-slot");
  const createBtn = document.getElementById("createStripBtn");
  const contador = document.getElementById("contador");

  const TAMANO = 600; // cada foto queda cuadrada, igual que las de la cámara
  let fotos = [];

  /* Elegir archivos (el <label> ya abre el selector al tocar) */
  fileInput.addEventListener("change", e => {
    agregarArchivos(e.target.files);
    fileInput.value = "";
  });

  /* Arrastrar y soltar (escritorio) */
  ["dragenter", "dragover"].forEach(ev =>
    dropZone.addEventListener(ev, e => {
      e.preventDefault();
      dropZone.classList.add("arrastrando");
    })
  );
  ["dragleave", "drop"].forEach(ev =>
    dropZone.addEventListener(ev, e => {
      e.preventDefault();
      dropZone.classList.remove("arrastrando");
    })
  );
  dropZone.addEventListener("drop", e => agregarArchivos(e.dataTransfer.files));

  async function agregarArchivos(lista) {
    const imagenes = Array.from(lista).filter(f => f.type.startsWith("image/"));
    for (const file of imagenes) {
      if (fotos.length >= 4) break;
      try {
        fotos.push(await recortarCuadrado(file));
      } catch (err) {
        console.error(err);
        alert(`No pudimos leer “${file.name}” 😭`);
      }
      render();
    }
  }

  /* Recorta el centro de la imagen en un cuadrado y la comprime */
  function recortarCuadrado(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const lado = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = (img.naturalWidth - lado) / 2;
        const sy = (img.naturalHeight - lado) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = TAMANO;
        canvas.height = TAMANO;
        canvas.getContext("2d").drawImage(img, sx, sy, lado, lado, 0, 0, TAMANO, TAMANO);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("imagen inválida")); };
      img.src = url;
    });
  }

  function render() {
    slots.forEach((slot, i) => {
      const foto = fotos[i];
      slot.style.backgroundImage = foto ? `url(${foto})` : "none";
      slot.classList.toggle("filled", !!foto);
    });
    contador.textContent = `${fotos.length}/4`;
    createBtn.disabled = fotos.length !== 4;
  }

  slots.forEach((slot, i) => {
    slot.querySelector(".remove-btn").addEventListener("click", e => {
      e.stopPropagation();
      fotos.splice(i, 1);
      render();
    });
  });

  createBtn.addEventListener("click", () => {
    try {
      localStorage.setItem("photostripFotos", JSON.stringify(fotos));
      localStorage.setItem("photostripOrigen", "subir.html");
      window.location.href = "personalizacion.html";
    } catch (e) {
      console.error(e);
      alert("Las imágenes son demasiado pesadas 😭");
    }
  });
});
