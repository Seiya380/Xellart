const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");
const pixelationRange = document.getElementById("pixelationRange");
const pixelValue = document.getElementById("pixelValue");
const video = document.getElementById('video');
const cameraCanvas = document.getElementById('cameraCanvas');
const cameraCtx = cameraCanvas.getContext('2d');

const imageBtn = document.getElementById('imageBtn');
const cameraBtn = document.getElementById('cameraBtn');
const imageSection = document.getElementById('imageSection');
const cameraSection = document.getElementById('cameraSection');
const uploadContainer = document.getElementById('uploadContainer');

let originalImage = null;
let animationId = null;
let cameraStream = null;

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

const resizeCameraCanvas = () => {
    const aspectRatio = video.videoWidth / video.videoHeight || 4/3;
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight - 120;

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }

    cameraCanvas.width = Math.floor(width);
    cameraCanvas.height = Math.floor(height);
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
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log("getUserMedia not supported on your browser!");
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            cameraStream = stream;
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                resizeCameraCanvas();
                renderCameraFrame();
            };
        })
        .catch(error => {
            console.error("Something went wrong!", error);
        });
};

const stopCam = () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        video.srcObject = null;
    }
};

const switchToImage = () => {
    imageBtn.classList.add('active');
    cameraBtn.classList.remove('active');
    imageSection.classList.remove('hidden');
    cameraSection.classList.add('hidden');
    uploadContainer.classList.remove('hidden');
    stopCam();
};

const switchToCamera = () => {
    cameraBtn.classList.add('active');
    imageBtn.classList.remove('active');
    cameraSection.classList.remove('hidden');
    imageSection.classList.add('hidden');
    uploadContainer.classList.add('hidden');
    startCam();
};

imageBtn.addEventListener('click', switchToImage);
cameraBtn.addEventListener('click', switchToCamera);

window.addEventListener('resize', () => {
    if (!cameraSection.classList.contains('hidden') && video.srcObject) {
        resizeCameraCanvas();
    }
});        