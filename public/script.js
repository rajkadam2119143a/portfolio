const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('year').textContent = new Date().getFullYear();

/* ---- Mobile nav ------------------------------------------------------- */
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ---- Scroll progress bar ---------------------------------------------- */
const progress = document.getElementById('progress');
let ticking = false;
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  progress.style.transform = `scaleX(${ratio})`;
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
updateProgress();

/* ---- Reveal on scroll (staggered within each group) -------------------- */
const revealTargets = document.querySelectorAll(
  '.skill-card, .project-card, .timeline-item, .achieve-item, .stat, .edu-item, .lang-item, .flow-step, .ai-cap'
);
revealTargets.forEach((el) => {
  const cls = el.classList[0];
  const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains(cls));
  el.style.setProperty('--i', String(Math.max(0, siblings.indexOf(el)) % 6));
  if (!reduceMotion) el.classList.add('reveal');
});
if (!reduceMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('in');
      revealObserver.unobserve(el);
      // Drop the reveal transition once settled so hover effects stay snappy.
      setTimeout(() => el.classList.remove('reveal', 'in'), 1100);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach((el) => revealObserver.observe(el));
}

/* ---- Active nav link ---------------------------------------------------- */
const navLinks = Array.from(nav.querySelectorAll('a'));
const sectionMap = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => a.classList.remove('active'));
    const link = sectionMap.get(entry.target.id);
    if (link) link.classList.add('active');
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sectionMap.forEach((_, id) => {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
});

/* ---- Count-up stats ------------------------------------------------------ */
const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    counterObserver.unobserve(entry.target);
    const el = entry.target;
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const start = performance.now();
    const duration = 1300;
    (function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    })(start);
  });
}, { threshold: 0.6 });
counters.forEach((el) => { if (!reduceMotion) el.textContent = '0' + (el.dataset.suffix || ''); counterObserver.observe(el); });

/* ---- Cursor spotlight on cards ------------------------------------------ */
document.addEventListener('pointermove', (e) => {
  const card = e.target.closest && e.target.closest('.stat, .skill-card, .project-card, .achieve-item, .lang-item, .contact-link, .ai-cap, .flow-step');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  card.style.setProperty('--my', `${e.clientY - rect.top}px`);
}, { passive: true });

/* ---- Typed focus line ---------------------------------------------------- */
const typedEl = document.getElementById('typed');
if (typedEl && !reduceMotion) {
  const phrases = [
    'Enterprise PHP & WordPress platforms',
    'React + WordPress headless builds',
    'AI-assisted development workflows',
    'Multisite, migrations & DR cutovers'
  ];
  let p = 0, i = 0, deleting = false;
  (function tick() {
    const word = phrases[p];
    typedEl.textContent = word.slice(0, i);
    let delay = deleting ? 28 : 55;
    if (!deleting && i === word.length) { deleting = true; delay = 1800; }
    else if (deleting && i === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 350; }
    i += deleting ? -1 : 1;
    setTimeout(tick, delay);
  })();
}

/* ---- Neural network canvas (hero) --------------------------------------- */
(function neural() {
  const canvas = document.getElementById('neural');
  const hero = document.getElementById('hero');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  const colour = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-blue').trim() || '#00B9FA';
  let w = 0, h = 0, dpr = 1, nodes = [], raf = 0, running = false;
  const pointer = { x: -9999, y: -9999 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(24, Math.min(90, Math.round((w * h) / 16000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.8
    }));
    if (reduceMotion) draw();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const link = 140;
    for (let a = 0; a < nodes.length; a++) {
      const n = nodes[a];
      for (let b = a + 1; b < nodes.length; b++) {
        const m = nodes[b];
        const d = Math.hypot(n.x - m.x, n.y - m.y);
        if (d < link) {
          ctx.globalAlpha = (1 - d / link) * 0.28;
          ctx.strokeStyle = colour; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
        }
      }
      const pd = Math.hypot(n.x - pointer.x, n.y - pointer.y);
      if (pd < 180) {
        ctx.globalAlpha = (1 - pd / 180) * 0.6;
        ctx.strokeStyle = colour; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
      }
      ctx.globalAlpha = 0.85; ctx.fillStyle = colour;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function step() {
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    draw();
    raf = requestAnimationFrame(step);
  }
  function start() { if (!running && !reduceMotion) { running = true; raf = requestAnimationFrame(step); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });

  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
  new IntersectionObserver((entries) => (entries[0].isIntersecting ? start() : stop()), { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  resize();
  start();
})();
