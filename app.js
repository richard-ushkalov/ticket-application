const registerBtn = document.querySelector('.register-a-trip');
const layer = document.querySelector('.camera-layer');
const video = document.getElementById('cam');
let stream = null;

registerBtn.addEventListener('click', async () => {
  layer.classList.add('camera-layer--open');   // синхронно, анимация пошла

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } }
    });
    video.srcObject = stream;
  } catch (err) {
    // сюда попадём при отказе — слой уже открыт и висит чёрным
  }
});