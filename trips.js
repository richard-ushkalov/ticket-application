// История поездок. Пока сервера нет — генерируем демо-данные относительно сегодняшнего дня.

const periodSelect = document.querySelector('.period__select');
const tripsBody = document.querySelector('.trips');

const TICKET_ID = '-7f3b-9e41c2d0a8b5';   // вымышленный
const HISTORY_DAYS = 90;

// «Случайное» число 0..1, но всегда одно и то же для одного seed —
// чтобы при перезагрузке история не менялась
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function makeDemoTrips() {
  const now = new Date();
  const trips = [];

  for (let daysAgo = 0; daysAgo < HISTORY_DAYS; daysAgo++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
    const seed = Math.floor(day.getTime() / 86_400_000);
    const tripsPerDay = 1 + Math.floor(seededRandom(seed) * 3);   // 1–3

    for (let i = 0; i < tripsPerDay; i++) {
      const minutes = 6 * 60 + Math.floor(seededRandom(seed * 7 + i) * 16 * 60);   // 06:00–22:00
      const date = new Date(day.getTime() + minutes * 60_000);
      if (date > now) continue;

      trips.push({
        date,
        ticketId: TICKET_ID,
        qrId: 69000 + Math.floor(seededRandom(seed * 13 + i) * 11000),
      });
    }
  }

  return trips.sort((a, b) => b.date - a.date);   // новые сверху
}

// 11.09.26 17:32
function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).slice(2)} `
    + `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const allTrips = makeDemoTrips();

function renderTrips() {
  const days = Number(periodSelect.value);
  const from = new Date();
  from.setDate(from.getDate() - days);

  tripsBody.replaceChildren();

  for (const trip of allTrips.filter((t) => t.date >= from)) {
    const row = tripsBody.insertRow();
    row.insertCell().textContent = formatDate(trip.date);
    row.insertCell().textContent = trip.ticketId;
    row.insertCell().textContent = trip.qrId;
  }
}

periodSelect.addEventListener('change', renderTrips);
renderTrips();
