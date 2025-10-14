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

/* --- Mobile hamburger menu --- */
(function () {
  const openBtn = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!openBtn || !menu) return;

  const closeBtn = menu.querySelector('.menu-close');
  const firstLink = menu.querySelector('a');

  function openMenu() {
    menu.classList.add('open');
    menu.removeAttribute('hidden');
    menu.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    menu.classList.remove('open');
    menu.setAttribute('hidden', '');
    menu.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    openBtn.focus();
  }

  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);

  // Close on Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });

  // Close after tapping a link
  menu.addEventListener('click', (e) => {
    if (e.target.matches('a')) closeMenu();
  });
})();

/* --- Mobile homepage carousel (auto-fade, full-bleed with auto height) --- */
(function () {
  const root = document.getElementById('home-carousel');
  if (!root) return;

  const viewport = root.querySelector('.mc-viewport');
  const slides   = Array.from(root.querySelectorAll('.mc-slide'));
  const dots     = Array.from(root.querySelectorAll('.mc-dot'));
  const prev     = root.querySelector('.mc-prev');
  const next     = root.querySelector('.mc-next');

  let i = 0, timer;
  const INTERVAL = 3500; // 5s

  function setViewportHeight() {
    const img = slides[i].querySelector('img');
    const w = viewport.clientWidth || window.innerWidth;
    // use natural ratio when available, fall back to on-screen ratio
    const ratio =
      (img.naturalHeight && img.naturalWidth)
        ? img.naturalHeight / img.naturalWidth
        : (img.getBoundingClientRect().height / Math.max(1, img.getBoundingClientRect().width)) || 0.75;
    viewport.style.height = Math.round(w * ratio) + 'px';
  }

  function show(n){
    slides[i].classList.remove('is-active');
    dots[i].removeAttribute('aria-current');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('is-active');
    dots[i].setAttribute('aria-current','true');
    setViewportHeight();
  }

  function start(){ stop(); timer = setInterval(()=> show(i+1), INTERVAL); }
  function stop(){ if (timer) clearInterval(timer); }

  prev.addEventListener('click', () => { show(i-1); start(); });
  next.addEventListener('click', () => { show(i+1); start(); });
  dots.forEach((d, idx) => d.addEventListener('click', () => { show(idx); start(); }));

  // keep height correct when images load or viewport changes
  slides.forEach(s => {
    const img = s.querySelector('img');
    if (img.complete) return;            // already loaded
    img.addEventListener('load', setViewportHeight, { once:true });
  });
  window.addEventListener('resize', setViewportHeight);

  // pause/resume on interaction
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('touchstart', stop, { passive:true });
  root.addEventListener('touchend', start);

  // kick off
  setViewportHeight();
  start();
})();
