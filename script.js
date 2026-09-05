const CITIES = [
  { code: 'DXB', name: 'Dubai' },
  { code: 'LHR', name: 'London' },
  { code: 'JFK', name: 'New York' },
  { code: 'BCN', name: 'Barcelona' },
  { code: 'MAD', name: 'Madrid' },
  { code: 'SIN', name: 'Singapore' },
  { code: 'CDG', name: 'Paris' },
  { code: 'NRT', name: 'Tokyo' },
];

const AIRLINES = [
  { code: 'SH', name: 'SkyHop Air' },
  { code: 'AV', name: 'Avion Blue' },
  { code: 'NR', name: 'Northern Wings' },
  { code: 'ZP', name: 'ZenPacific' },
];

let state = {
  origin: null,
  destination: null,
  date: null,
  passengers: 1,
  selectedFlight: null,
  passenger: null,
};

// --- Populate selects -----------------------------------------------
const originSelect = document.getElementById('origin');
const destinationSelect = document.getElementById('destination');

function fillCitySelect(select, defaultIndex) {
  select.innerHTML = CITIES.map((c, i) =>
    `<option value="${c.code}" ${i === defaultIndex ? 'selected' : ''}>${c.name} (${c.code})</option>`
  ).join('');
}

fillCitySelect(originSelect, 0);
fillCitySelect(destinationSelect, 3);

document.getElementById('swapBtn').addEventListener('click', () => {
  const a = originSelect.value;
  originSelect.value = destinationSelect.value;
  destinationSelect.value = a;
});

// Default date: 14 days from now
const dateInput = document.getElementById('travelDate');
const defaultDate = new Date(Date.now() + 14 * 86400000);
dateInput.value = defaultDate.toISOString().slice(0, 10);
dateInput.min = new Date().toISOString().slice(0, 10);

// --- Step navigation ----------------------------------------------------
function showStep(id) {
  document.querySelectorAll('.step').forEach((s) => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-back]').forEach((btn) => {
  btn.addEventListener('click', () => showStep(btn.dataset.back));
});

// --- Deterministic sample flight generation ------------------------------
function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

function generateFlights(originCode, destCode, dateStr) {
  const rand = seededRandom(hashStr(`${originCode}-${destCode}-${dateStr}`));
  const count = 3 + Math.floor(rand() * 3); // 3-5 flights
  const flights = [];

  for (let i = 0; i < count; i++) {
    const airline = AIRLINES[Math.floor(rand() * AIRLINES.length)];
    const depHour = 5 + Math.floor(rand() * 17);
    const depMin = Math.floor(rand() * 12) * 5;
    const durationMin = 90 + Math.floor(rand() * 600);
    const price = 120 + Math.floor(rand() * 780);

    const dep = new Date(`${dateStr}T00:00:00`);
    dep.setHours(depHour, depMin);
    const arr = new Date(dep.getTime() + durationMin * 60000);

    flights.push({
      id: `${airline.code}${100 + Math.floor(rand() * 900)}`,
      airline,
      depTime: dep,
      arrTime: arr,
      durationMin,
      price,
      stops: rand() > 0.7 ? 1 : 0,
    });
  }

  return flights.sort((a, b) => a.depTime - b.depTime);
}

function fmtTime(d) {
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
}

function fmtDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

function cityName(code) {
  return CITIES.find((c) => c.code === code)?.name || code;
}

// --- Search --------------------------------------------------------------
document.getElementById('searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  state.origin = originSelect.value;
  state.destination = destinationSelect.value;
  state.date = dateInput.value;
  state.passengers = document.getElementById('passengers').value;

  if (state.origin === state.destination) {
    alert('Please choose two different cities.');
    return;
  }

  renderResults();
  showStep('step-results');
});

function renderResults() {
  document.getElementById('resultsTitle').textContent =
    `${cityName(state.origin)} → ${cityName(state.destination)} · ${formatDateLong(state.date)}`;

  const flights = generateFlights(state.origin, state.destination, state.date);
  const list = document.getElementById('resultsList');
  list.innerHTML = flights.map((f) => `
    <div class="flight-card" data-id="${f.id}">
      <div class="airline-badge">${f.airline.code}</div>
      <div class="flight-mid">
        <div class="flight-route">
          ${fmtTime(f.depTime)} <span class="arrow">→</span> ${fmtTime(f.arrTime)}
        </div>
        <p class="flight-meta">${f.airline.name} · ${f.id} · ${fmtDuration(f.durationMin)} · ${f.stops === 0 ? 'Nonstop' : f.stops + ' stop'}</p>
      </div>
      <div class="flight-price">$${f.price}<span>per passenger</span></div>
    </div>
  `).join('');

  list.querySelectorAll('.flight-card').forEach((card) => {
    card.addEventListener('click', () => {
      const flight = flights.find((f) => f.id === card.dataset.id);
      state.selectedFlight = flight;
      renderFlightSummary();
      showStep('step-details');
    });
  });
}

function formatDateLong(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function renderFlightSummary() {
  const f = state.selectedFlight;
  document.getElementById('flightSummary').innerHTML = `
    <strong>${cityName(state.origin)} → ${cityName(state.destination)}</strong>
    ${f.airline.name} ${f.id} · ${formatDateLong(state.date)} · ${fmtTime(f.depTime)}–${fmtTime(f.arrTime)}
    · $${f.price} × ${state.passengers} passenger${state.passengers > 1 ? 's' : ''} =
    <strong>$${f.price * state.passengers}</strong>
  `;
}

// --- Passenger details -> ticket -----------------------------------------
document.getElementById('detailsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  state.passenger = {
    name: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    seat: document.getElementById('seatPref').value,
  };
  renderTicket();
  showStep('step-ticket');
});

function generatePNR(seedStr) {
  const rand = seededRandom(hashStr(seedStr + Date.now()));
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(rand() * chars.length)];
  return out;
}

function renderTicket() {
  const f = state.selectedFlight;
  const p = state.passenger;
  const pnr = generatePNR(p.name + p.email);
  const seatNumber = 10 + Math.floor(Math.random() * 20);
  const seatLetter = ['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)];

  document.getElementById('ticketCard').innerHTML = `
    <div class="ticket-head">
      <p class="airline-name">${f.airline.name} · Boarding Pass</p>
      <div class="ticket-route">
        <div>
          <div class="city">${state.origin}</div>
          <div class="code">${cityName(state.origin)}</div>
        </div>
        <div class="plane">✈</div>
        <div style="text-align:right">
          <div class="city">${state.destination}</div>
          <div class="code">${cityName(state.destination)}</div>
        </div>
      </div>
    </div>
    <div class="ticket-body">
      <div class="ticket-grid">
        <div class="ticket-field"><span class="k">Passenger</span><span class="v">${escapeHtml(p.name)}</span></div>
        <div class="ticket-field"><span class="k">Flight</span><span class="v">${f.id}</span></div>
        <div class="ticket-field"><span class="k">Date</span><span class="v">${formatDateLong(state.date)}</span></div>
        <div class="ticket-field"><span class="k">Departs</span><span class="v">${fmtTime(f.depTime)}</span></div>
        <div class="ticket-field"><span class="k">Arrives</span><span class="v">${fmtTime(f.arrTime)}</span></div>
        <div class="ticket-field"><span class="k">Seat</span><span class="v">${seatNumber}${seatLetter} (${p.seat === 'none' ? 'any' : p.seat})</span></div>
      </div>
      <div class="ticket-perf"></div>
      <div class="ticket-grid">
        <div class="ticket-field"><span class="k">Confirmation</span><span class="v">${pnr}</span></div>
        <div class="ticket-field"><span class="k">Passengers</span><span class="v">${state.passengers}</span></div>
        <div class="ticket-field"><span class="k">Total paid</span><span class="v">$${f.price * state.passengers}</span></div>
      </div>
      <div class="barcode"></div>
      <p class="pnr-note">This is a sample/demo ticket — not a real booking.</p>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById('printTicket').addEventListener('click', () => window.print());
