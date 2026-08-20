/* ═══════════════════════════════════════════════════
   CAFE CATALYST — script.js v4
   Pop-out hover with sibling dimming
═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* 1. PRELOADER */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => setTimeout(() => preloader.classList.add('hidden'), 350));
    setTimeout(() => preloader.classList.add('hidden'), 3000);
  }

  /* 2. DARK / LIGHT MODE */
  const darkToggle = document.getElementById('darkToggle');
  const body = document.body;
  if (localStorage.getItem('ccTheme') === 'light') {
    body.classList.add('light');
    if (darkToggle) darkToggle.innerHTML = '&#9790;';
  }
  if (darkToggle) {
    darkToggle.addEventListener('click', () => {
      body.classList.toggle('light');
      const l = body.classList.contains('light');
      darkToggle.innerHTML = l ? '&#9790;' : '&#9788;';
      localStorage.setItem('ccTheme', l ? 'light' : 'dark');
    });
  }

  /* 3. NAVBAR SCROLL */
  const navbar = document.getElementById('navbar');
  function handleScroll() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* 4. MOBILE MENU */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  function closeMobile() {
    if (hamburger && mobileNav) {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      body.style.overflow = '';
    }
  }
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', closeMobile));
    document.addEventListener('click', e => { if (navbar && !navbar.contains(e.target)) closeMobile(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobile(); });
  }

  /* 5. STAT COUNTERS */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const dur = 2000, start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(step); else el.textContent = target;
    })(start);
  }
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  let counted = false;
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats && statNums.length) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        statNums.forEach((el, i) => setTimeout(() => animateCounter(el), i * 180));
      }
    }, { threshold: 0.4 }).observe(heroStats);
  }

  /* 6. REVEAL ON SCROLL */
  document.querySelectorAll('.reveal').forEach(el => {
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const siblings = Array.from(e.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
          setTimeout(() => e.target.classList.add('visible'), siblings.indexOf(e.target) * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }).observe(el);
  });

  /* ═══════════════════════════════════════════════════
     7. CARD HOVER — POP-OUT + SIBLING DIM
     Hovered card lifts and grows, siblings fade
  ═══════════════════════════════════════════════════ */
  const cardGrids = [
    { grid: '.services-grid',  card: '.service-card' },
    { grid: '.values-grid',    card: '.value-card' },
    { grid: '.ecosystem-grid', card: '.eco-card' },
    { grid: '.addons-grid',    card: '.addon-card' },
    { grid: '.posts-grid',     card: '.post-card' },
    { grid: '.jobs-grid',      card: '.job-card' },
    { grid: '.pricing-grid',   card: '.price-card' },
    { grid: '.vendor-grid',    card: '.vendor-card' },
    { grid: '.cat-grid',       card: '.cat-card' },
    { grid: '.how-grid',       card: '.how-card' },
    { grid: '.packages-grid',  card: '.pkg-card' }
  ];

  cardGrids.forEach(({ grid, card }) => {
    document.querySelectorAll(grid).forEach(parent => {
      const cards = parent.querySelectorAll(card);

      cards.forEach(c => {
        /* MOUSE */
        c.addEventListener('mouseenter', () => {
          cards.forEach(s => { if (s !== c) s.classList.add('card-dim'); });
        });
        c.addEventListener('mouseleave', () => {
          cards.forEach(s => s.classList.remove('card-dim'));
        });

        /* TOUCH — tap to focus, tap elsewhere to dismiss */
        if ('ontouchstart' in window) {
          c.addEventListener('touchstart', function () {
            const wasActive = this.classList.contains('touch-active');
            cards.forEach(s => { s.classList.remove('touch-active', 'card-dim'); });
            if (!wasActive) {
              this.classList.add('touch-active');
              cards.forEach(s => { if (s !== this) s.classList.add('card-dim'); });
            }
          }, { passive: true });
        }
      });
    });
  });

  /* Tap outside any card to dismiss touch-active */
  if ('ontouchstart' in window) {
    document.addEventListener('touchstart', e => {
      if (!e.target.closest('.service-card, .value-card, .eco-card, .addon-card, .post-card, .job-card, .price-card, .vendor-card, .cat-card, .how-card, .pkg-card')) {
        document.querySelectorAll('.card-dim, .touch-active').forEach(el => {
          el.classList.remove('card-dim', 'touch-active');
        });
      }
    }, { passive: true });
  }

  /* 8. CONTACT FORM */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const setErr = (i, e) => { if (i) i.classList.toggle('error', e); };
  const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  if (form && success) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const n = document.getElementById('fullName'), p = document.getElementById('phone'),
            em = document.getElementById('email'), r = document.getElementById('requirements');
      let ok = true;
      if (!n.value.trim()) { setErr(n,1); ok=0; } else setErr(n,0);
      if (p.value.replace(/\D/g,'').length < 7) { setErr(p,1); ok=0; } else setErr(p,0);
      if (!validEmail(em.value.trim())) { setErr(em,1); ok=0; } else setErr(em,0);
      if (!r.value.trim()) { setErr(r,1); ok=0; } else setErr(r,0);
      if (!ok) { form.querySelector('.error')?.focus(); return; }
      const btn = form.querySelector('.form-submit'), orig = btn.textContent;
      btn.textContent = 'Sending\u2026'; btn.disabled = true; btn.style.opacity = '0.7';
      setTimeout(() => {
        success.classList.add('show'); form.reset();
        btn.textContent = orig; btn.disabled = false; btn.style.opacity = '';
        setTimeout(() => success.classList.remove('show'), 5000);
      }, 900);
    });
    form.querySelectorAll('input, textarea').forEach(el => el.addEventListener('input', () => setErr(el,0)));
  }

  /* 9. FOOTER YEAR */
  document.querySelectorAll('#year, .year').forEach(el => el.textContent = new Date().getFullYear());

  /* 10. ACTIVE NAV */
  const secs = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link:not(.nav-cta)');
  if (secs.length && links.length) {
    secs.forEach(s => {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            links.forEach(l => l.classList.toggle('active',
              l.getAttribute('href') === '#' + e.target.id));
          }
        });
      }, { threshold: 0.25, rootMargin: '-72px 0px -40% 0px' }).observe(s);
    });
  }

  /* 11. BACK TO TOP */
  const btt = document.getElementById('backToTop');
  if (btt) {
    window.addEventListener('scroll', () => btt.classList.toggle('visible', window.scrollY > 500), { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* 12. SMOOTH ANCHORS */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = a.getAttribute('href'); if (t === '#') return;
      const el = document.querySelector(t);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); history.pushState(null,'',t); }
    });
  });

  /* 13. AI CHIPS */
  document.querySelectorAll('.ai-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.q, a = chip.dataset.a, chatBody = document.getElementById('aiChatBody');
      if (!chatBody || !q || !a) return;
      const um = document.createElement('div'); um.className = 'ai-msg user-msg'; um.textContent = q;
      const bm = document.createElement('div'); bm.className = 'ai-msg bot-msg'; bm.innerHTML = a;
      chatBody.appendChild(um);
      setTimeout(() => { chatBody.appendChild(bm); chatBody.scrollTop = chatBody.scrollHeight; }, 350);
    });
  });

})();