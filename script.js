const countEl = document.getElementById('count');
const tapBtn = document.getElementById('tapBtn');
const resetBtn = document.getElementById('resetBtn');

let count = 0;
try {
  const stored = window.localStorage.getItem('pulse-count');
  if (stored !== null) count = parseInt(stored, 10) || 0;
} catch (e) {
  // localStorage unavailable — start from 0
}

function render() {
  countEl.textContent = count.toLocaleString();
}

function persist() {
  try {
    window.localStorage.setItem('pulse-count', String(count));
  } catch (e) {
    // ignore storage failures
  }
}

function pulse() {
  countEl.classList.remove('pulse');
  // force reflow so the animation can re-trigger on rapid taps
  void countEl.offsetWidth;
  countEl.classList.add('pulse');
}

function increment() {
  count += 1;
  render();
  persist();
  pulse();
}

tapBtn.addEventListener('click', increment);

resetBtn.addEventListener('click', () => {
  count = 0;
  render();
  persist();
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    increment();
  }
});

render();
