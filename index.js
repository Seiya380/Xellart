const $ = id => document.getElementById(id);

const canvas = $("canvas"), ctx = canvas.getContext("2d");
const cameraCanvas = $('cameraCanvas'), cameraCtx = cameraCanvas.getContext('2d');
const video = $('video'), upload = $("upload");
const pixelationRange = $("pixelationRange"), pixelValue = $("pixelValue");
const imageBtn = $('imageBtn'), cameraBtn = $('cameraBtn');
const imageSection = $('imageSection'), cameraSection = $('cameraSection');
const uploadContainer = $('uploadContainer');

let originalImage = null, animationId = null, cameraStream = null, facingMode = 'user';

upload.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = event => {
    const img = new Image();
    img.onload = () => {
      originalImage = img;
      pixelateImage(parseInt(pixelationRange.value));
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

pixelationRange.addEventListener("input", function() {
  pixelValue.textContent = this.value;
  if (originalImage) pixelateImage(parseInt(this.value));
});

function pixelateImage(factor) {
  if (!originalImage) return;
  const w = originalImage.width, h = originalImage.height;
  canvas.width = w;
  canvas.height = h;
  if (factor <= 1) return ctx.drawImage(originalImage, 0, 0, w, h);
  const scaledW = Math.max(1, Math.floor(w / factor));
  const scaledH = Math.max(1, Math.floor(h / factor));
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(originalImage, 0, 0, scaledW, scaledH);
  ctx.drawImage(canvas, 0, 0, scaledW, scaledH, 0, 0, w, h);
}

const resizeCameraCanvas = () => {
  const aspectRatio = video.videoWidth / video.videoHeight || 4/3;
  const maxW = window.innerWidth, maxH = window.innerHeight - 120;
  let w = maxW, h = w / aspectRatio;
  if (h > maxH) { h = maxH; w = h * aspectRatio; }
  cameraCanvas.width = Math.floor(w);
  cameraCanvas.height = Math.floor(h);
};

const renderCameraFrame = () => {
  if (!video.srcObject) return;
  const factor = parseInt(pixelationRange.value);
  const w = cameraCanvas.width, h = cameraCanvas.height;
  cameraCtx.imageSmoothingEnabled = false;
  if (factor <= 1) {
    cameraCtx.drawImage(video, 0, 0, w, h);
  } else {
    const scaledW = Math.max(1, Math.floor(w / factor));
    const scaledH = Math.max(1, Math.floor(h / factor));
    cameraCtx.drawImage(video, 0, 0, scaledW, scaledH);
    cameraCtx.drawImage(cameraCanvas, 0, 0, scaledW, scaledH, 0, 0, w, h);
  }
  animationId = requestAnimationFrame(renderCameraFrame);
};

const startCam = () => {
  if (!navigator.mediaDevices?.getUserMedia) return;
  cameraCanvas.classList.toggle('mirrored', facingMode === 'user');
  navigator.mediaDevices.getUserMedia({ video: { facingMode } })
    .then(stream => {
      cameraStream = stream;
      video.srcObject = stream;
      video.onloadedmetadata = () => { resizeCameraCanvas(); renderCameraFrame(); };
    })
    .catch(err => console.error("Camera error:", err));
};

const stopCam = () => {
  if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
    video.srcObject = null;
  }
};

const switchMode = (isCamera) => {
  imageBtn.classList.toggle('active', !isCamera);
  cameraBtn.classList.toggle('active', isCamera);
  imageSection.classList.toggle('hidden', isCamera);
  cameraSection.classList.toggle('hidden', !isCamera);
  uploadContainer.classList.toggle('hidden', isCamera);
  isCamera ? startCam() : stopCam();
};

const download = (canvasEl, filename) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvasEl.toDataURL('image/png');
  link.click();
};

imageBtn.addEventListener('click', () => switchMode(false));
cameraBtn.addEventListener('click', () => switchMode(true));
window.addEventListener('resize', () => {
  if (!cameraSection.classList.contains('hidden') && video.srcObject) resizeCameraCanvas();
});
$('downloadImageBtn').addEventListener('click', () => {
  if (!originalImage) return alert('Please choose an image first!');
  download(canvas, 'pixelated-image.png');
});
$('screenshotBtn').addEventListener('click', () => {
  if (video.srcObject) download(cameraCanvas, 'camera-screenshot.png');
});
$('switchCameraBtn').addEventListener('click', () => {
  facingMode = facingMode === 'user' ? 'environment' : 'user';
  stopCam();
  startCam();
});
