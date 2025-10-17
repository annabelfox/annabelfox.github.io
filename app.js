// app.js — shared (v3 with swipe via Pointer Events)

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

// 3) Newsletter form (Formspree)
document.addEventListener("DOMContentLoaded", function() {
  const form = document.querySelector(".newsletter-form");
  if (!form) return;

  // ensure a message node exists (graceful if not in HTML)
  let message = document.querySelector(".form-message");
  if (!message) {
    message = document.createElement('div');
    message.className = 'form-message';
    message.style.display = 'none';
    form.appendChild(message);
  }

  form.addEventListener("submit", async function(event) {
    event.preventDefault();

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
});

/* 4) Accessible dropdown toggle for "Commission and Contact" */
(function () {
  const ddParent = document.querySelector('.has-dd');
  if (!ddParent) return;

  const trigger = ddParent.querySelector('.dd-trigger');

  trigger.addEventListener('click', () => {
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

/* 5) Mobile hamburger menu */
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

/* 6) Mobile homepage carousel (auto-fade + swipe) */
(function () {
  const root = document.getElementById('home-carousel');
  if (!root) return;

  const viewport = root.querySelector('.mc-viewport');
  const slides   = Array.from(root.querySelectorAll('.mc-slide'));
  const dots     = Array.from(root.querySelectorAll('.mc-dot'));
  const prev     = root.querySelector('.mc-prev');
  const next     = root.querySelector('.mc-next');

  let i = 0, timer;
  const INTERVAL = 3500; // 3.5s auto-advance

  function setViewportHeight() {
    const img = slides[i].querySelector('img');
    const w = viewport.clientWidth || window.innerWidth;
    const rect = img.getBoundingClientRect();
    const ratio =
      (img.naturalHeight && img.naturalWidth)
        ? img.naturalHeight / img.naturalWidth
        : (rect.height / Math.max(1, rect.width)) || 0.75;
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

  // Buttons + dots
  prev.addEventListener('click', () => { show(i-1); start(); });
  next.addEventListener('click', () => { show(i+1); start(); });
  dots.forEach((d, idx) => d.addEventListener('click', () => { show(idx); start(); }));

  // Height on load/resize
  slides.forEach(s => {
    const img = s.querySelector('img');
    if (!img.complete) img.addEventListener('load', setViewportHeight, { once:true });
  });
  window.addEventListener('resize', setViewportHeight);

  // Pause/resume on hover/touch
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('touchstart', stop, { passive:true });
  root.addEventListener('touchend', start);

  // ---- Swipe (Pointer Events with Touch fallback) ----
  const SWIPE_THRESHOLD = 40;
  const usePointer = 'PointerEvent' in window;

  let tracking = false;
  let startX = 0, startY = 0, activeId = null;

  function onPointerDown(e){
    // ignore mouse drags; swipe is for touch/pen
    if (e.pointerType === 'mouse') return;
    tracking = true;
    activeId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    viewport.setPointerCapture?.(activeId);
    stop(); // pause auto-play while dragging
  }
  function onPointerMove(e){
    if (!tracking || e.pointerId !== activeId) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    // if horizontal intent, prevent page scroll
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      e.preventDefault();
    }
  }
  function endSwipe(dx){
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) show(i+1); else show(i-1);
    }
    start(); // resume auto
  }
  function onPointerUp(e){
    if (!tracking || e.pointerId !== activeId) return;
    const dx = e.clientX - startX;
    tracking = false;
    viewport.releasePointerCapture?.(activeId);
    endSwipe(dx);
  }
  function onPointerCancel(){
    tracking = false;
    start();
  }

  function attachTouchFallback(el){
    let sx=0, sy=0;
    el.addEventListener('touchstart', (e) => {
      if (!e.touches.length) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      stop();
    }, { passive:true });

    el.addEventListener('touchmove', (e) => {
      const tx = e.touches[0].clientX;
      const ty = e.touches[0].clientY;
      const dx = tx - sx;
      const dy = ty - sy;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        e.preventDefault(); // stop page from scrolling horizontally
      }
    }, { passive:false });

    el.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - sx;
      endSwipe(dx);
    });
    el.addEventListener('touchcancel', start, { passive:true });
  }

  if (usePointer) {
    viewport.addEventListener('pointerdown', onPointerDown, { passive:true });
    viewport.addEventListener('pointermove', onPointerMove, { passive:false });
    viewport.addEventListener('pointerup', onPointerUp);
    viewport.addEventListener('pointercancel', onPointerCancel);
  } else {
    attachTouchFallback(viewport);
  }

  // Pause autoplay if the carousel is off-screen (battery-friendly)
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? start() : stop());
    }, { threshold: 0.1 });
    io.observe(root);
  }

  // kick off
  setViewportHeight();
  start();
})();
