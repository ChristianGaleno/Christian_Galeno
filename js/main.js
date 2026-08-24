'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function safeGetTheme() {
  try {
    return localStorage.getItem('theme');
  } catch (e) {
    return null;
  }
}

function safeSetTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
  } catch (e) {
    // Storage unavailable — theme still applies for this page view.
  }
}

// ── Reveal-on-scroll animations ──
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach((el) => revealObserver.observe(el));

// ── Nav: active link highlight + scrolled shadow ──
// Section offsets are cached so the scroll handler never forces a layout, and
// the handler itself runs at most once per frame.
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const mainNav = document.getElementById('mainNav');

let sectionOffsets = [];
let scrollQueued = false;

function measureSections() {
  sectionOffsets = Array.from(sections, (section) => ({
    id: section.id,
    top: section.offsetTop,
  }));
}

function updateNav() {
  scrollQueued = false;
  const y = window.scrollY;

  let currentId = '';
  for (const section of sectionOffsets) {
    if (y >= section.top - 100) currentId = section.id;
  }
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === '#' + currentId;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  if (mainNav) mainNav.classList.toggle('scrolled', y > 50);
}

function requestNavUpdate() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(updateNav);
}

measureSections();
updateNav();
window.addEventListener('scroll', requestNavUpdate, { passive: true });

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    measureSections();
    updateNav();
  }, 150);
}, { passive: true });

// Fonts and images settle after `load`, which shifts every section offset.
window.addEventListener('load', () => {
  measureSections();
  updateNav();
});

// ── Theme toggle ──
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  const paintToggle = (theme) => {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  };

  paintToggle(document.documentElement.getAttribute('data-theme'));

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const theme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    safeSetTheme(theme);
    paintToggle(theme);
  });

  // Follow the OS only while the visitor has not made an explicit choice.
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  systemDark.addEventListener('change', (e) => {
    if (safeGetTheme()) return;
    const theme = e.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    paintToggle(theme);
  });
}

// ── Mobile menu ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  const mobileLinks = mobileMenu.querySelectorAll('a');

  const setMenu = (open) => {
    mobileMenu.classList.toggle('open', open);
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  };

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!mobileMenu.classList.contains('open')) return;
    setMenu(false);
    if (restoreFocus) hamburger.focus();
  };

  hamburger.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('open');
    setMenu(open);
    if (open) mobileLinks[0]?.focus();
  });

  mobileLinks.forEach((link) => link.addEventListener('click', () => closeMenu()));

  document.addEventListener('keydown', (e) => {
    if (!mobileMenu.classList.contains('open')) return;

    if (e.key === 'Escape') {
      closeMenu({ restoreFocus: true });
      return;
    }

    if (e.key !== 'Tab') return;

    // Keep focus inside the menu; the hamburger doubles as the close control.
    const focusable = [hamburger, ...mobileLinks];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
  });

  // Resizing past the breakpoint hides the hamburger, which would otherwise
  // strand an open menu with the page scroll still locked.
  window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
    if (e.matches) closeMenu();
  });
}

// ── Cursor glow (pointer devices only) ──
const glow = document.getElementById('cursorGlow');
if (glow && window.matchMedia('(pointer:fine)').matches) {
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });
}

// ── Hero particles ──
const particleContainer = document.getElementById('heroParticles');
if (particleContainer && !prefersReducedMotion) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.width = (Math.random() * 4 + 2) + 'px';
    p.style.height = p.style.width;
    p.style.animationDelay = (Math.random() * 6) + 's';
    p.style.animationDuration = (Math.random() * 4 + 4) + 's';
    p.style.opacity = Math.random() * 0.15 + 0.05;
    fragment.appendChild(p);
  }
  particleContainer.appendChild(fragment);
}

// ── Animated stat counters ──
// The markup carries the real figures so they survive with JS disabled; the
// count-up only takes over once the script is running.
const counters = document.querySelectorAll('.stat-num[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    counterObserver.unobserve(el);
    const target = parseInt(el.dataset.count, 10);
    if (Number.isNaN(target) || target < 1) return;
    let count = 0;
    const step = () => {
      count++;
      el.textContent = count + '+';
      if (count < target) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: 0.5 });

if (!prefersReducedMotion) {
  counters.forEach((c) => {
    c.textContent = '0+';
    counterObserver.observe(c);
  });
}

// In-page anchors rely on CSS `scroll-behavior`, which honours
// prefers-reduced-motion; `scrollIntoView({behavior:'smooth'})` did not.
