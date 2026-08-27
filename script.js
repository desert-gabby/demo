const STORAGE_KEY = 'haven-admin-state-v1';

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Twin'];
const STATUS_CYCLE = ['available', 'occupied', 'cleaning', 'maintenance'];

function seedData() {
  const rooms = [];
  let n = 101;
  for (let floor = 1; floor <= 3; floor++) {
    for (let i = 0; i < 5; i++) {
      const num = floor * 100 + i + 1;
      rooms.push({
        number: num,
        type: ROOM_TYPES[(num + floor) % ROOM_TYPES.length],
        status: i === 0 ? 'cleaning' : i === 4 ? 'maintenance' : 'available',
      });
    }
  }

  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (d, days) => new Date(d.getTime() + days * 86400000);

  const bookings = [
    { id: cryptoId(), guest: 'Amelia Torres', room: 102, checkin: iso(addDays(today, -1)), checkout: iso(addDays(today, 2)) },
    { id: cryptoId(), guest: 'Kenji Watanabe', room: 205, checkin: iso(today), checkout: iso(addDays(today, 1)) },
    { id: cryptoId(), guest: 'Priya Nair', room: 301, checkin: iso(addDays(today, 3)), checkout: iso(addDays(today, 5)) },
  ];

  // Mark rooms with active bookings as occupied
  bookings.forEach((b) => {
    if (b.checkin <= iso(today) && b.checkout >= iso(today)) {
      const room = rooms.find((r) => r.number === b.room);
      if (room) room.status = 'occupied';
    }
  });

  return { rooms, bookings };
}

function cryptoId() {
  return 'b' + Math.random().toString(36).slice(2, 10);
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fall through to fresh seed
  }
  const fresh = seedData();
  saveState(fresh);
  return fresh;
}

function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore storage failures (e.g. private browsing)
  }
}

let state = loadState();

// --- Navigation ------------------------------------------------------
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const viewTitle = document.getElementById('viewTitle');

navItems.forEach((btn) => {
  btn.addEventListener('click', () => {
    navItems.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.view;
    views.forEach((v) => v.classList.toggle('hidden', v.id !== `view-${target}`));
    viewTitle.textContent = btn.textContent.trim();
    renderAll();
  });
});

document.getElementById('todayDate').textContent = new Date().toLocaleDateString(undefined, {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

// --- Rendering ---------------------------------------------------------
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isActiveBooking(b) {
  const t = todayIso();
  return b.checkin <= t && b.checkout >= t;
}

function bookingStatus(b) {
  const t = todayIso();
  if (b.checkout < t) return 'past';
  if (b.checkin > t) return 'upcoming';
  return 'active';
}

function renderStats() {
  const total = state.rooms.length;
  const occupied = state.rooms.filter((r) => r.status === 'occupied').length;
  const available = state.rooms.filter((r) => r.status === 'available').length;
  const bookingsToday = state.bookings.filter(isActiveBooking).length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statOccupied').textContent = occupied;
  document.getElementById('statAvailable').textContent = available;
  document.getElementById('statBookingsToday').textContent = bookingsToday;
}

function roomCardHtml(room) {
  return `
    <div class="room-card" data-room="${room.number}">
      <p class="room-number">Room ${room.number}</p>
      <p class="room-type">${room.type}</p>
      <span class="room-status ${room.status}">${capitalize(room.status)}</span>
    </div>
  `;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function renderRoomGrids() {
  const html = state.rooms.map(roomCardHtml).join('');
  document.getElementById('dashboardRoomGrid').innerHTML = html;
  document.getElementById('roomsGrid').innerHTML = html;
}

function attachRoomClickHandlers() {
  document.querySelectorAll('.room-card').forEach((card) => {
    card.addEventListener('click', () => {
      const num = parseInt(card.dataset.room, 10);
      const room = state.rooms.find((r) => r.number === num);
      if (!room) return;
      const idx = STATUS_CYCLE.indexOf(room.status);
      room.status = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
      saveState(state);
      renderAll();
    });
  });
}

function renderRoomSelect() {
  const select = document.getElementById('roomSelect');
  select.innerHTML = state.rooms
    .map((r) => `<option value="${r.number}">Room ${r.number} — ${r.type}</option>`)
    .join('');
}

function renderBookingsTable() {
  const body = document.getElementById('bookingsBody');
  if (!state.bookings.length) {
    body.innerHTML = `<tr class="empty-row"><td colspan="6">No bookings yet.</td></tr>`;
    return;
  }
  body.innerHTML = state.bookings
    .slice()
    .sort((a, b) => a.checkin.localeCompare(b.checkin))
    .map((b) => `
      <tr>
        <td>${escapeHtml(b.guest)}</td>
        <td>${b.room}</td>
        <td>${b.checkin}</td>
        <td>${b.checkout}</td>
        <td><span class="badge ${bookingStatus(b)}">${capitalize(bookingStatus(b))}</span></td>
        <td><button class="btn-link" data-remove="${b.id}">Remove</button></td>
      </tr>
    `)
    .join('');

  body.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.bookings = state.bookings.filter((b) => b.id !== btn.dataset.remove);
      saveState(state);
      renderAll();
    });
  });
}

function renderGuestsTable() {
  const body = document.getElementById('guestsBody');
  if (!state.bookings.length) {
    body.innerHTML = `<tr class="empty-row"><td colspan="4">No guests yet.</td></tr>`;
    return;
  }
  body.innerHTML = state.bookings
    .slice()
    .sort((a, b) => a.checkin.localeCompare(b.checkin))
    .map((b) => `
      <tr>
        <td>${escapeHtml(b.guest)}</td>
        <td>${b.room}</td>
        <td>${b.checkin} → ${b.checkout}</td>
        <td><span class="badge ${bookingStatus(b)}">${capitalize(bookingStatus(b))}</span></td>
      </tr>
    `)
    .join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderAll() {
  renderStats();
  renderRoomGrids();
  attachRoomClickHandlers();
  renderRoomSelect();
  renderBookingsTable();
  renderGuestsTable();
}

// --- Booking form --------------------------------------------------------
document.getElementById('bookingForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const guest = document.getElementById('guestName').value.trim();
  const room = parseInt(document.getElementById('roomSelect').value, 10);
  const checkin = document.getElementById('checkinDate').value;
  const checkout = document.getElementById('checkoutDate').value;

  if (!guest || !room || !checkin || !checkout) return;
  if (checkout < checkin) {
    alert('Check-out date must be after check-in date.');
    return;
  }

  state.bookings.push({ id: cryptoId(), guest, room, checkin, checkout });

  const roomObj = state.rooms.find((r) => r.number === room);
  if (roomObj && isActiveBooking({ checkin, checkout })) {
    roomObj.status = 'occupied';
  }

  saveState(state);
  e.target.reset();
  renderAll();
});

// --- Reset demo data -----------------------------------------------------
document.getElementById('resetData').addEventListener('click', () => {
  if (!confirm('Reset all demo data back to the initial sample set?')) return;
  state = seedData();
  saveState(state);
  renderAll();
});

renderAll();
