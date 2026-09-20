/* ============================================================
   tarpeg007 portfolio — interactions & motion (real-data build)
   ============================================================ */
(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- preloader ---------- */
  const preloader = document.getElementById('preloader');
  const barFill = document.getElementById('preBarFill');
  let progress = 0;
  const tick = setInterval(() => {
    progress = Math.min(100, progress + Math.random() * 22);
    if (barFill) barFill.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        preloader.classList.add('done');
        heroIntro();
      }, 350);
    }
  }, 130);

  /* ---------- hero intro ---------- */
  function heroIntro() {
    if (!window.gsap || reduced) {
      document.querySelectorAll('.hero .line').forEach(l => l.style.transform = 'none');
      document.querySelectorAll('.hero [data-reveal]').forEach(el => {
        el.style.opacity = 1; el.style.transform = 'none';
      });
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero .line', { y: 0, duration: 1.1, stagger: 0.12 }, 0.1)
      .to('.hero [data-reveal]', { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.45)
      .from('.hero-img-wrap', { opacity: 0, scale: 0.92, y: 40, duration: 1.2, ease: 'power3.out' }, 0.2);
  }

  /* ---------- custom cursor ---------- */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (matchMedia('(hover:hover)').matches) {
    let rx = 0, ry = 0, tx = 0, ty = 0;
    addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = `translate(${tx - 3}px,${ty - 3}px)`;
    });
    (function loop() {
      rx += (tx - rx) * 0.16; ry += (ty - ry) * 0.16;
      ring.style.transform = `translate(${rx - 17}px,${ry - 17}px)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a,button,.weapon,.op-row,.cve-card,.find-card,.log-row').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
  } else { dot?.remove(); ring?.remove(); }

  /* ---------- nav ---------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 40);
  }, { passive: true });
  burger?.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      burger?.classList.remove('open');
      navLinks.classList.remove('open');
    })
  );

  /* active section highlight */
  const sections = document.querySelectorAll('[data-section], section.hero');
  const linkMap = new Map(
    [...document.querySelectorAll('.nav-link')].map(a => [a.dataset.section, a])
  );
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        linkMap.forEach(l => l.classList.remove('active'));
        linkMap.get(en.target.id)?.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => io.observe(s));

  /* ---------- GSAP scroll reveals ---------- */
  if (window.gsap && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.section [data-reveal]').forEach(el => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    /* counters */
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = +el.dataset.count;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
        onUpdate: () => el.textContent = Math.round(obj.v)
      });
    });

    /* wanted poster entrance */
    gsap.from('.wanted-poster', {
      opacity: 0, y: 60, rotate: 3, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.wanted-poster', start: 'top 85%' }
    });

    /* marquee speed on scroll (subtle) */
    const track = document.getElementById('marqueeTrack');
    if (track) {
      ScrollTrigger.create({
        trigger: '.marquee', start: 'top bottom', end: 'bottom top',
        onUpdate: self => {
          const v = 26 * (1 - Math.abs(self.getVelocity() / 3000) * 0.4);
          track.style.animationDuration = Math.max(8, v) + 's';
        }
      });
    }
  } else {
    document.querySelectorAll('.section [data-reveal]').forEach(el => {
      el.style.opacity = 1; el.style.transform = 'none';
    });
    document.querySelectorAll('[data-count]').forEach(el => el.textContent = el.dataset.count);
  }

  /* ============================================================
     PARTICLE DISSOLVE — darkness peeling off Teach
     ============================================================ */
  const canvas = document.getElementById('particleCanvas');
  if (!canvas || reduced) return;
  const ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;

  let W, H, DPR;
  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    const r = wrap.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  addEventListener('resize', () => { resize(); });

  const N = 90;
  const parts = [];
  function spawn(x, y, burst) {
    parts.push({
      x: x ?? W * (0.5 + Math.random() * 0.42),
      y: y ?? H * (0.15 + Math.random() * 0.7),
      vx: (0.15 + Math.random() * 0.75) * (burst ? 3 : 1),
      vy: (Math.random() - 0.5) * 0.5,
      life: 0,
      max: 140 + Math.random() * 160,
      r: 0.6 + Math.random() * 2.1,
      tw: Math.random() * Math.PI * 2
    });
  }

  let running = false;
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life++;
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.004;
      p.vx *= 0.995;
      p.tw += 0.08;
      const fade = 1 - p.life / p.max;
      if (fade <= 0 || p.x > W + 10) { parts.splice(i, 1); continue; }
      const flick = 0.55 + Math.sin(p.tw) * 0.45;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.7 + fade * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,57,70,${(0.5 * fade * flick).toFixed(3)})`;
      ctx.fill();
    }
    if (parts.length < N && Math.random() < 0.5) spawn();
    if (running) requestAnimationFrame(frame);
  }

  const vio = new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !running) { running = true; requestAnimationFrame(frame); }
    else if (!en.isIntersecting) running = false;
  }, { threshold: 0.05 });
  vio.observe(wrap);

  /* click = particle burst */
  wrap.addEventListener('pointerdown', e => {
    const r = wrap.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    for (let i = 0; i < 26; i++) spawn(x, y, true);
    if (!running) { running = true; requestAnimationFrame(frame); }
  });
})();
