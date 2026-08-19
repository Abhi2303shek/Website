/* ═══════════════════════════════════════════════
   CAFE CATALYST — script.js
═══════════════════════════════════════════════ */

/* ─────────────────────────────────
   1. DARK / LIGHT MODE TOGGLE
───────────────────────────────── */
const darkToggle = document.getElementById('darkToggle');
const body = document.body;

// On load: restore saved preference (default = dark)
const saved = localStorage.getItem('ccTheme');
if (saved === 'light') {
  body.classList.add('light');
  darkToggle.textContent = '☀️';
}

darkToggle.addEventListener('click', () => {
  body.classList.toggle('light');
  const isLight = body.classList.contains('light');
  darkToggle.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('ccTheme', isLight ? 'light' : 'dark');
});


/* ─────────────────────────────────
   2. STICKY NAVBAR ON SCROLL
───────────────────────────────── */
const navbar = document.getElementById('navbar');

function handleNavScroll() {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // run once on load


/* ─────────────────────────────────
   3. HAMBURGER MOBILE MENU
───────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when a link is clicked
mobileNav.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
  });
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
  }
});


/* ─────────────────────────────────
   4. STAT COUNTER ANIMATION
───────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800; // ms
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }

  requestAnimationFrame(step);
}

// Trigger when hero is in view (once)
const statNums = document.querySelectorAll('.stat-num[data-target]');
let countersStarted = false;

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      statNums.forEach(el => animateCounter(el));
      statObserver.disconnect();
    }
  });
}, { threshold: 0.4 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statObserver.observe(heroStats);


/* ─────────────────────────────────
   5. SCROLL-REVEAL ANIMATION
───────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger cards in the same parent
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
      const delay = siblings.indexOf(entry.target) * 60;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));


/* ─────────────────────────────────
   6. FLASH SALE MODAL
───────────────────────────────── */
const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');

function showModal() {
  // Only show if not already dismissed this session
  if (sessionStorage.getItem('ccModalDismissed')) return;
  modalOverlay.classList.add('show');
}

function hideModal() {
  modalOverlay.classList.remove('show');
  sessionStorage.setItem('ccModalDismissed', '1');
}

// Show after 3 seconds
setTimeout(showModal, 3000);

// Close on ✕
modalClose.addEventListener('click', hideModal);

// Close on overlay click (outside the modal card)
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) hideModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('show')) hideModal();
});


/* ─────────────────────────────────
   7. CONTACT FORM VALIDATION
───────────────────────────────── */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

function setError(input, hasError) {
  if (hasError) {
    input.classList.add('error');
  } else {
    input.classList.remove('error');
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName');
    const phone    = document.getElementById('phone');
    const email    = document.getElementById('email');
    const requirements = document.getElementById('requirements');

    let valid = true;

    // Validate name
    if (!fullName.value.trim()) {
      setError(fullName, true);
      valid = false;
    } else {
      setError(fullName, false);
    }

    // Validate phone (basic: at least 7 digits)
    const phoneDigits = phone.value.replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      setError(phone, true);
      valid = false;
    } else {
      setError(phone, false);
    }

    // Validate email
    if (!validateEmail(email.value.trim())) {
      setError(email, true);
      valid = false;
    } else {
      setError(email, false);
    }

    // Validate requirements
    if (!requirements.value.trim()) {
      setError(requirements, true);
      valid = false;
    } else {
      setError(requirements, false);
    }

    if (!valid) return;

    // Simulate form submission (no backend)
    const submitBtn = contactForm.querySelector('.form-submit');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      formSuccess.classList.add('show');
      contactForm.reset();
      submitBtn.textContent = 'Send Message →';
      submitBtn.disabled = false;
      // Hide success after 5s
      setTimeout(() => formSuccess.classList.remove('show'), 5000);
    }, 800);
  });

  // Clear error state on input
  contactForm.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => setError(el, false));
  });
}


/* ─────────────────────────────────
   8. FOOTER YEAR
───────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ─────────────────────────────────
   9. ACTIVE NAV LINK ON SCROLL
───────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${id}` ||
          (id === 'home' && link.getAttribute('href') === 'index.html')
        );
      });
    }
  });
}, { threshold: 0.35, rootMargin: `-${68}px 0px 0px 0px` });

sections.forEach(s => sectionObserver.observe(s));