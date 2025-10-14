// app.js — shared

// 1) Keep footer year fresh on every page
document.querySelectorAll('[id^="year"]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
  
  // 2) Simple Lightbox with captions (Portfolio images)
  (function () {
    const figures = Array.from(document.querySelectorAll('.gallery figure'));
    if (!figures.length) return;
  
    // Build overlay once
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <button class="lb-btn lb-close" aria-label="Close">×</button>
      <button class="lb-btn lb-prev" aria-label="Previous">‹</button>
      <img alt="">
      <button class="lb-btn lb-next" aria-label="Next">›</button>
      <div class="lb-caption" role="note"></div>
    `;
    document.body.appendChild(lb);
  
    const imgEl     = lb.querySelector('img');
    const capEl     = lb.querySelector('.lb-caption');
    const btnPrev   = lb.querySelector('.lb-prev');
    const btnNext   = lb.querySelector('.lb-next');
    const btnClose  = lb.querySelector('.lb-close');
  
    const items = figures.map(fig => {
      const img = fig.querySelector('img');
      const caption = (fig.querySelector('figcaption')?.textContent || img.alt || '').trim();
      return { img, caption };
    });
  
    let index = 0;
  
    function open(i) {
      index = i;
      const src = items[index].img.getAttribute('data-full') || items[index].img.src;
      imgEl.src = src;
      imgEl.alt = items[index].img.alt || '';
      capEl.textContent = items[index].caption;
      lb.classList.add('open');
    }
    function close() {
      lb.classList.remove('open');
      imgEl.src = '';
      capEl.textContent = '';
    }
    function prev() { open((index - 1 + items.length) % items.length); }
    function next() { open((index + 1) % items.length); }
  
    // Hooks
    items.forEach((it, i) => it.img.addEventListener('click', () => open(i)));
    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', prev);
    btnNext.addEventListener('click', next);
  
    // Close on backdrop click
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  
    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
  })();
  
  document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector(".newsletter-form");
    const message = document.querySelector(".form-message");
  
    if (form) {
      form.addEventListener("submit", async function(event) {
        event.preventDefault(); // stops the page from reloading
  
        const formData = new FormData(form);
  
        try {
          const response = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: { Accept: "application/json" }
          });
  
          if (response.ok) {
            message.textContent = "✅ Thank you for subscribing!";
            message.style.color = "#2e7d32";
            message.style.display = "block";
            form.reset();
          } else {
            message.textContent = "⚠️ Oops! Something went wrong. Please try again.";
            message.style.color = "#c62828";
            message.style.display = "block";
          }
        } catch (error) {
          message.textContent = "⚠️ Network error. Please try again later.";
          message.style.color = "#c62828";
          message.style.display = "block";
        }
      });
    }
  });
  
/* --- Accessible dropdown toggle for "Commission and Contact" --- */
(function () {
  const ddParent = document.querySelector('.has-dd');
  if (!ddParent) return;

  const trigger = ddParent.querySelector('.dd-trigger');

  trigger.addEventListener('click', (e) => {
    const isOpen = ddParent.classList.toggle('open');
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!ddParent.contains(e.target)) {
      ddParent.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      ddParent.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }
  });
})();
