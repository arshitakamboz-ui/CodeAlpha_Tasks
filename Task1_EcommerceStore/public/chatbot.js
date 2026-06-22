(function() {
  const style = document.createElement('style');
  style.textContent = `
    #chatbot-toggle {
      position: fixed; bottom: 24px; right: 24px;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #6c5ce7, #4834d4);
      color: #fff; border: none; font-size: 26px; cursor: pointer;
      box-shadow: 0 4px 14px rgba(72,52,212,0.4); z-index: 9998;
      transition: transform 0.2s;
    }
    #chatbot-toggle:hover { transform: scale(1.08); }
    #chatbot-window {
      position: fixed; bottom: 96px; right: 24px;
      width: 320px; max-height: 440px; background: #fff;
      border-radius: 14px; box-shadow: 0 8px 30px rgba(0,0,0,0.2);
      display: none; flex-direction: column; overflow: hidden;
      z-index: 9998; font-family: 'Segoe UI', Arial, sans-serif;
    }
    #chatbot-window.open { display: flex; }
    #chatbot-header {
      background: linear-gradient(135deg, #6c5ce7, #4834d4);
      color: #fff; padding: 14px 18px; font-weight: 700; font-size: 15px;
    }
    #chatbot-messages { flex: 1; padding: 14px; overflow-y: auto; font-size: 13px; background: #f4f5fb; }
    .chat-msg { margin-bottom: 10px; max-width: 85%; padding: 10px 14px; border-radius: 12px; line-height: 1.4; }
    .chat-msg.bot { background: #ece9ff; color: #2d2451; border-bottom-left-radius: 2px; }
    .chat-msg.user { background: #6c5ce7; color: #fff; margin-left: auto; border-bottom-right-radius: 2px; }
    #chatbot-input-area { display: flex; border-top: 1px solid #eee; }
    #chatbot-input { flex: 1; border: none; padding: 12px; font-size: 13px; outline: none; }
    #chatbot-send { background: #6c5ce7; color: #fff; border: none; padding: 0 18px; cursor: pointer; font-size: 13px; font-weight: 600; }
    .chip-row { display: flex; gap: 6px; flex-wrap: wrap; padding: 0 14px 10px; }
    .chip { background: #fff; border: 1px solid #ddd8ff; color: #4834d4; font-size: 11px; padding: 6px 10px; border-radius: 14px; cursor: pointer; }
    .chip:hover { background: #ece9ff; }
  `;
  document.head.appendChild(style);

  const toggle = document.createElement('button');
  toggle.id = 'chatbot-toggle';
  toggle.innerHTML = '💬';
  document.body.appendChild(toggle);

  const win = document.createElement('div');
  win.id = 'chatbot-window';
  win.innerHTML = `
    <div id="chatbot-header">🤖 Store Assistant</div>
    <div id="chatbot-messages"></div>
    <div class="chip-row">
      <span class="chip" data-q="shipping">Shipping</span>
      <span class="chip" data-q="returns">Returns</span>
      <span class="chip" data-q="payment">Payment</span>
      <span class="chip" data-q="track">Track Order</span>
    </div>
    <div id="chatbot-input-area">
      <input id="chatbot-input" type="text" placeholder="Ask me something...">
      <button id="chatbot-send">Send</button>
    </div>
  `;
  document.body.appendChild(win);

  const messages = win.querySelector('#chatbot-messages');
  const input = win.querySelector('#chatbot-input');

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + sender;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  let greeted = false;
  toggle.addEventListener('click', function() {
    win.classList.toggle('open');
    if (!greeted) {
      addMessage("Hi! 👋 I'm your shopping assistant. Ask me about shipping, returns, payment, or tracking — or use the quick buttons below!", 'bot');
      greeted = true;
    }
  });

  function getReply(text) {
    const q = text.toLowerCase();
    if (q.includes('shipping') || q.includes('delivery')) return "We offer free shipping on all orders! Delivery usually takes 3-5 business days.";
    if (q.includes('return') || q.includes('refund')) return "You can return any item within 7 days of delivery for a full refund.";
    if (q.includes('payment') || q.includes('pay')) return "We accept Cards, UPI, Net Banking, and Cash on Delivery.";
    if (q.includes('track')) return "Once logged in, your order ID appears right after checkout — that's your tracking reference.";
    if (q.includes('cart')) return "Click the 🛒 Cart icon in the navbar anytime to view or edit your cart.";
    if (q.includes('login') || q.includes('register') || q.includes('account')) return "Click 'Register' to create an account, or 'Login' if you already have one!";
    if (q.includes('discount') || q.includes('offer') || q.includes('coupon')) return "Check back soon — we run seasonal discounts and offers regularly!";
    if (q.includes('hi') || q.includes('hello') || q.includes('hey')) return "Hello! How can I help you with your shopping today?";
    if (q.includes('thank')) return "You're welcome! Happy shopping! 🛍️";
    return "I'm not totally sure about that — but feel free to ask about shipping, returns, payment, or your cart!";
  }

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    setTimeout(function() { addMessage(getReply(text), 'bot'); }, 400);
  }

  win.querySelector('#chatbot-send').addEventListener('click', handleSend);
  input.addEventListener('keypress', function(e) { if (e.key === 'Enter') handleSend(); });

  win.querySelectorAll('.chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      const q = chip.getAttribute('data-q');
      addMessage(chip.textContent, 'user');
      setTimeout(function() { addMessage(getReply(q), 'bot'); }, 400);
    });
  });
})();