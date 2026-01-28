const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");
const pixelationRange = document.getElementById("pixelationRange");
const pixelValue = document.getElementById("pixelValue");
const video = document.getElementById('video');
const cameraCanvas = document.getElementById('cameraCanvas');
const cameraCtx = cameraCanvas.getContext('2d');

// Variable globale pour stocker l'objet Image source et y accéder partout
let originalImage = null;

// Cette fonction s'exécute une fois que le fichier est chargé en mémoire
upload.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  //it will read the metadata 
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      originalImage = img;
      // Premier rendu de pixelisation dès l'upload
      pixelateImage(parseInt(pixelationRange.value));
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});
// Écouteur sur le slider pour mettre à jour l'effet en temps réel
pixelationRange.addEventListener("input", function () {
  pixelValue.textContent = this.value;
  if (originalImage) {
    pixelateImage(parseInt(this.value));
  }
});
//this is the function for the pixel
function pixelateImage(pixelationFactor) {
  if (!originalImage) return;

  const w = originalImage.width;
  const h = originalImage.height;

  canvas.width = w;
  canvas.height = h;

  if (pixelationFactor <= 1) {
    ctx.drawImage(originalImage, 0, 0, w, h);
    return;
  }

  const scaledW = Math.max(1, Math.floor(w / pixelationFactor));
  const scaledH = Math.max(1, Math.floor(h / pixelationFactor));

  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(originalImage, 0, 0, scaledW, scaledH);

  ctx.drawImage(canvas, 0, 0, scaledW, scaledH, 0, 0, w, h);
}

const stopCam = () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            const stream = video.srcObject;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                video.srcObject = null;
            }
            cameraCtx.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
        };

        const renderCameraFrame = () => {
            if (!video.srcObject) return;

            const pixelationFactor = parseInt(pixelationRange.value);
            const w = cameraCanvas.width;
            const h = cameraCanvas.height;

            cameraCtx.imageSmoothingEnabled = false;

            if (pixelationFactor <= 1) {
                cameraCtx.drawImage(video, 0, 0, w, h);
            } else {
                const scaledW = Math.max(1, Math.floor(w / pixelationFactor));
                const scaledH = Math.max(1, Math.floor(h / pixelationFactor));

                cameraCtx.drawImage(video, 0, 0, scaledW, scaledH);
                cameraCtx.drawImage(cameraCanvas, 0, 0, scaledW, scaledH, 0, 0, w, h);
            }

            animationId = requestAnimationFrame(renderCameraFrame);
        };

        const startCam = () => {
            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                        video.srcObject = stream;
                        video.onloadedmetadata = () => {
                            renderCameraFrame();
                        };
                    })
                    .catch(error => {
                        console.error("Something went wrong!", error);
                    });
            } else {
                console.log("getUserMedia not supported on your browser!");
            }
        };

        document.addEventListener('DOMContentLoaded', () => {
            startCam();
        });