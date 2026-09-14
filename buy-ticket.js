// ---------- тип билета, количество, сумма ----------

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 10;

const typeSelect = document.querySelector('.order__select');
const badgeText = document.querySelector('.ticket-badge__text');
const minusBtn = document.querySelector('.stepper__button--minus');
const plusBtn = document.querySelector('.stepper__button--plus');
const quantityOutput = document.querySelector('.stepper__value');
const amountOutput = document.querySelector('.order__amount');

let quantity = MIN_QUANTITY;

function updateOrder() {
  const option = typeSelect.selectedOptions[0];
  const amount = Number(option.dataset.price) * quantity;

  badgeText.textContent = option.dataset.badge;
  quantityOutput.textContent = quantity;
  amountOutput.textContent = `€ ${amount.toFixed(2)}`;

  minusBtn.disabled = quantity <= MIN_QUANTITY;
  plusBtn.disabled = quantity >= MAX_QUANTITY;
}

typeSelect.addEventListener('change', updateOrder);

minusBtn.addEventListener('click', () => {
  quantity = Math.max(MIN_QUANTITY, quantity - 1);
  updateOrder();
});

plusBtn.addEventListener('click', () => {
  quantity = Math.min(MAX_QUANTITY, quantity + 1);
  updateOrder();
});

updateOrder();


// ---------- способ оплаты (свой выпадающий список — у <select> не бывает иконок) ----------

const dropdown = document.querySelector('.dropdown');
const toggle = dropdown.querySelector('.dropdown__toggle');
const toggleValue = dropdown.querySelector('.dropdown__value');
const list = dropdown.querySelector('.dropdown__list');
const options = [...list.querySelectorAll('.dropdown__option')];

let paymentMethod = null;

function openList() {
  list.hidden = false;
  toggle.setAttribute('aria-expanded', 'true');
  (options.find((o) => o.getAttribute('aria-selected') === 'true') ?? options[0]).focus();
}

function closeList() {
  list.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
}

toggle.addEventListener('click', () => {
  if (list.hidden) openList();
  else closeList();
});

for (const option of options) {
  option.addEventListener('click', () => {
    paymentMethod = option.dataset.value;

    options.forEach((o) => o.setAttribute('aria-selected', String(o === option)));
    // показываем в поле ту же иконку и название, что у выбранного пункта
    toggleValue.replaceChildren(...option.cloneNode(true).childNodes);
    toggleValue.classList.remove('dropdown__value--placeholder');

    closeList();
    toggle.focus();
    updatePayButton();
  });
}

// клик мимо списка или Esc — закрыть
document.addEventListener('click', (event) => {
  if (!dropdown.contains(event.target)) closeList();
});

document.addEventListener('keydown', (event) => {
  if (list.hidden) return;

  if (event.key === 'Escape') {
    closeList();
    toggle.focus();
  }

  // стрелки двигают фокус по пунктам
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    const current = options.indexOf(document.activeElement);
    options[(current + step + options.length) % options.length].focus();
  }
});


// ---------- согласие и кнопка PAY ----------

const termsCheckbox = document.querySelector('.terms__checkbox');
const payBtn = document.querySelector('.pay');

function updatePayButton() {
  payBtn.disabled = !(termsCheckbox.checked && paymentMethod !== null);
}

termsCheckbox.addEventListener('change', updatePayButton);
