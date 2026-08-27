// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Theme toggle with persisted preference
const root = document.documentElement;
const toggleBtn = document.getElementById('themeToggle');

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

let stored = null;
try {
  stored = window.localStorage.getItem('aurora-theme');
} catch (e) {
  // localStorage unavailable (e.g. private browsing) — fall back silently
}

const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(stored || (prefersDark ? 'dark' : 'light'));

toggleBtn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try {
    window.localStorage.setItem('aurora-theme', next);
  } catch (e) {
    // ignore storage failures
  }
});

// Demo contact form — no backend, just a friendly confirmation
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = form.querySelector('input').value.trim();
  note.textContent = email
    ? `Thanks — this is a demo, so nothing was actually sent for ${email}.`
    : 'Enter an email to see the demo confirmation.';
  form.reset();
});
