// Общий скрипт для всех страниц. Подключается в <head> без defer:
// событие pagereveal должно быть поймано до первой отрисовки.

// ---------- «назад» как в приложении ----------
// Если пришли со страницы этого же сайта — шаг назад по истории,
// иначе (страницу открыли по прямой ссылке) — обычный переход по href.
document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-back]');
  if (!link) return;

  const cameFromApp = document.referrer !== '' && new URL(document.referrer).origin === location.origin;
  if (cameFromApp && history.length > 1) {
    event.preventDefault();
    history.back();
  }
});

// ---------- направление анимации перехода ----------
// При возврате назад страница уезжает вправо, а не выезжает справа.

// браузер может пропустить анимацию (например, вкладка в фоне) — это не ошибка
const ignoreSkippedTransition = (event) => event.viewTransition?.ready.catch(() => {});
window.addEventListener('pageswap', ignoreSkippedTransition);

window.addEventListener('pagereveal', (event) => {
  if (!event.viewTransition) return;
  ignoreSkippedTransition(event);

  if (!window.navigation || !navigation.activation) return;

  const { navigationType, from, entry } = navigation.activation;
  if (navigationType === 'traverse' && from && entry.index < from.index) {
    event.viewTransition.types.add('back');
  }
});

// ---------- офлайн ----------

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
