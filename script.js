const chatWindow = document.getElementById('chatWindow');
const composer = document.getElementById('composer');
const input = document.getElementById('messageInput');
const quickReplies = document.getElementById('quickReplies');

// --- Simulated concierge "brain" -------------------------------------
// Simple keyword-matched rules, checked in order. Not a real AI model —
// this is a scripted demo so the app runs with zero backend/API keys.
const RULES = [
  {
    test: /\b(hi|hello|hey|good (morning|afternoon|evening))\b/i,
    reply: () => pick([
      "Hello! Welcome — how can I help make your stay great today?",
      "Hi there! I'm your concierge. What can I do for you?",
    ]),
  },
  {
    test: /check[- ]?in|check[- ]?out/i,
    reply: () => "Check-in is from 3:00 PM, and check-out is by 11:00 AM. Late check-out may be available on request — just let the front desk know.",
  },
  {
    test: /wifi|wi-fi|password|internet/i,
    reply: () => "The wifi network is “Guest-Lobby” and the password is printed on your room key sleeve. Let me know if it's not working!",
  },
  {
    test: /restaurant|eat|food|dinner|lunch|breakfast|hungry/i,
    reply: () => pick([
      "For a great dinner nearby, I'd suggest the little Italian place two blocks north — ask for a window table. There's also a fantastic ramen spot open until midnight.",
      "Breakfast is served in the main hall from 7–10:30 AM. For dinner, the rooftop bistro across the street has wonderful views and a seasonal menu.",
    ]),
  },
  {
    test: /spa|massage|book (a|an)? ?appointment/i,
    reply: () => "I'd be happy to help you book the spa. We have openings at 2:00 PM and 4:30 PM today — would either of those work?",
  },
  {
    test: /\b(2 ?pm|2:00|4:30|4 ?pm)\b/i,
    reply: () => "Great — I've noted that time. A real booking system isn't wired up in this demo, but that's exactly the kind of thing the concierge would confirm for you!",
  },
  {
    test: /weather/i,
    reply: () => "I don't have live weather data in this demo, but the front desk can print today's forecast for you.",
  },
  {
    test: /taxi|uber|cab|airport|transport/i,
    reply: () => "I can call a taxi to the lobby, usually a 5–10 minute wait. For the airport, allow about 40 minutes with traffic.",
  },
  {
    test: /thank(s| you)/i,
    reply: () => pick(["You're very welcome!", "Happy to help — anytime!", "Of course! Let me know if there's anything else."]),
  },
  {
    test: /bye|goodbye|see you/i,
    reply: () => "Goodbye! Have a wonderful stay. 👋",
  },
  {
    test: /who are you|what are you|real ai|are you (a )?bot/i,
    reply: () => "I'm a small simulated concierge built for this demo — scripted responses, no real AI model behind me (yet!).",
  },
];

const FALLBACKS = [
  "I'm just a demo concierge, so my answers are pretty limited — but I'd be glad to help with check-in times, dining, wifi, or booking the spa!",
  "That's outside what this little demo covers. Try asking about check-in, restaurants, wifi, or the spa.",
];

function pick(options) {
  return options[Math.floor(Math.random() * options.length)];
}

function getReply(text) {
  for (const rule of RULES) {
    if (rule.test.test(text)) return rule.reply();
  }
  return pick(FALLBACKS);
}

// --- Chat rendering -----------------------------------------------------
function addMessage(text, sender) {
  const el = document.createElement('div');
  el.className = `msg ${sender}`;
  el.textContent = text;
  chatWindow.appendChild(el);
  scrollToBottom();
}

function showTyping() {
  const el = document.createElement('div');
  el.className = 'typing';
  el.id = 'typingIndicator';
  el.innerHTML = '<span></span><span></span><span></span>';
  chatWindow.appendChild(el);
  scrollToBottom();
}

function hideTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function handleUserMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  addMessage(trimmed, 'user');
  input.value = '';

  showTyping();
  const delay = 500 + Math.random() * 600;
  setTimeout(() => {
    hideTyping();
    addMessage(getReply(trimmed), 'bot');
  }, delay);
}

composer.addEventListener('submit', (e) => {
  e.preventDefault();
  handleUserMessage(input.value);
});

quickReplies.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  handleUserMessage(btn.dataset.msg);
});

// Greet on load
addMessage("Hello! I'm your concierge. Ask me about check-in times, dining, wifi, or spa bookings.", 'bot');
