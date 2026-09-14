/* global jsQR */   // функция из vendor/jsQR.js, подключена отдельным <script>

// ---------- камера ----------

const registerBtn = document.querySelector('.register-a-trip');
const layer = document.querySelector('.camera-layer');
const video = document.getElementById('cam');
const closeBtn = document.getElementById('cam-close');
const cameraError = document.querySelector('.camera-layer__error');
const qrDialog = document.querySelector('.qr-dialog');
const qrValue = document.querySelector('.qr-dialog__value');
let stream = null;

function isCameraOpen() {
  return layer.classList.contains('camera-layer--open');
}

function stopStream(mediaStream) {
  mediaStream.getTracks().forEach((track) => track.stop());
}

registerBtn.addEventListener('click', async () => {
  layer.classList.add('camera-layer--open');   // синхронно, анимация пошла
  cameraError.hidden = true;

  try {
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } }
    });

    // пока висел запрос разрешения, слой могли закрыть — камера не нужна
    if (!isCameraOpen()) {
      stopStream(newStream);
      return;
    }

    stream = newStream;
    video.srcObject = stream;
    video.play().catch(() => { /* слой закрыли раньше, чем видео стартовало */ });
    scanFrame();
  } catch {
    // отказ в доступе, нет камеры или страница не по https
    cameraError.hidden = false;
  }
});

function closeCamera() {
  layer.classList.remove('camera-layer--open');
  stopScanning();

  if (stream) {
    stopStream(stream);   // иначе камера и индикатор записи остаются включёнными
    stream = null;
  }
  video.srcObject = null;
}

closeBtn.addEventListener('click', closeCamera);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isCameraOpen()) closeCamera();
});


// ---------- распознавание QR ----------

const MAX_SCAN_SIZE = 720;   // кадр уменьшаем: jsQR быстрее, а QR всё равно читается
const SCAN_INTERVAL = 150;   // мс между попытками

const scanCanvas = document.createElement('canvas');
const scanContext = scanCanvas.getContext('2d', { willReadFrequently: true });
let scanTimer = null;

function scanFrame() {
  if (!stream) return;

  if (typeof jsQR === 'function' && video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
    const scale = Math.min(1, MAX_SCAN_SIZE / Math.max(video.videoWidth, video.videoHeight));
    const width = Math.round(video.videoWidth * scale);
    const height = Math.round(video.videoHeight * scale);

    if (scanCanvas.width !== width || scanCanvas.height !== height) {
      scanCanvas.width = width;
      scanCanvas.height = height;
    }

    scanContext.drawImage(video, 0, 0, width, height);
    const image = scanContext.getImageData(0, 0, width, height);
    const code = jsQR(image.data, width, height, { inversionAttempts: 'dontInvert' });

    if (code) {
      onQrFound(code.data);
      return;
    }
  }

  scanTimer = setTimeout(scanFrame, SCAN_INTERVAL);
}

function stopScanning() {
  clearTimeout(scanTimer);
  scanTimer = null;
}

function onQrFound(value) {
  stopScanning();
  video.pause();              // «замораживаем» кадр под плашкой
  navigator.vibrate?.(80);    // отклик на Android (на iPhone API нет)

  qrValue.textContent = value;
  qrDialog.showModal();
}

// OK (form method="dialog") или Esc закрывают плашку → возвращаемся на главный экран
qrDialog.addEventListener('close', closeCamera);


// ---------- подсказка об установке ----------

const installHint = document.querySelector('.install-hint');
const installTextAndroid = installHint.querySelector('[data-platform="android"]');
const installTextIos = installHint.querySelector('[data-platform="ios"]');
const installBtn = document.querySelector('.install-hint__install');
const installCloseBtn = document.querySelector('.install-hint__close');

const isStandalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
// iPadOS притворяется маком, отличаем по тач-экрану
const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent)
  || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1);

let installPrompt = null;   // событие beforeinstallprompt (Android / Chrome)
let hintDismissed = false;
let splashDone = document.documentElement.classList.contains('no-splash');

try {
  hintDismissed = localStorage.getItem('install-hint-dismissed') === '1';
} catch { /* хранилище недоступно */ }

installTextAndroid.hidden = isIos;
installTextIos.hidden = !isIos;

function updateInstallHint() {
  const canInstall = isIos || installPrompt !== null;
  installHint.hidden = !(splashDone && !isStandalone && !hintDismissed && canInstall);
  installBtn.hidden = installPrompt === null;
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();   // вместо стандартной плашки Chrome показываем свою
  installPrompt = event;
  updateInstallHint();
});

installBtn.addEventListener('click', async () => {
  const promptEvent = installPrompt;
  installPrompt = null;     // событие одноразовое
  updateInstallHint();

  promptEvent.prompt();
  await promptEvent.userChoice;
});

window.addEventListener('appinstalled', () => {
  installPrompt = null;
  updateInstallHint();
});

installCloseBtn.addEventListener('click', () => {
  hintDismissed = true;
  try {
    localStorage.setItem('install-hint-dismissed', '1');
  } catch { /* хранилище недоступно */ }
  updateInstallHint();
});


// ---------- splash ----------

const splash = document.querySelector('.splash');

if (splashDone) {
  updateInstallHint();
} else {
  setTimeout(() => {
    splash.classList.add('splash--hidden');
    splashDone = true;
    try {
      sessionStorage.setItem('splash-shown', '1');
    } catch { /* хранилище недоступно */ }
    updateInstallHint();
  }, 900);
}
