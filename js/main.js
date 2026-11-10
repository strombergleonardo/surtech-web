/* ═══════════════════════════════════════════════════════════════════
   SURTECH · SITIO CORPORATIVO — Interactividad
   Simulador Contable SurTech V2.1
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var doc = document;
  var prefersReduced = function () {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /* ── Navbar: estado al hacer scroll + botón volver arriba ─────── */

  var navbar = doc.getElementById('navbar');
  var toTop = doc.getElementById('to-top');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 8);
    toTop.classList.toggle('visible', window.scrollY > 480);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
  });

  /* ── Menú móvil ───────────────────────────────────────────────── */

  var navToggle = doc.getElementById('nav-toggle');
  var navLinks = doc.getElementById('nav-links');

  navToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menú');
    });
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── Animaciones de aparición (reveal) ─────────────────────────── */

  var revealEls = doc.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ── Contadores animados ──────────────────────────────────────── */

  function animateCount(el, target) {
    if (prefersReduced()) { el.textContent = String(target); return; }
    var duration = 1200;
    var start = null;
    function tick(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  var counters = doc.querySelectorAll('[data-count]');

  if ('IntersectionObserver' in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        animateCount(el, parseInt(el.getAttribute('data-count'), 10) || 0);
        countIO.unobserve(el);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { countIO.observe(el); });
  }

  /* ── Scrollspy: enlace activo según sección visible ───────────── */

  var linkMap = {};
  navLinks.querySelectorAll('a[href^="#"]').forEach(function (a) {
    linkMap[a.getAttribute('href').slice(1)] = a;
  });

  if ('IntersectionObserver' in window) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        Object.keys(linkMap).forEach(function (key) {
          linkMap[key].classList.toggle('active', key === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    doc.querySelectorAll('main section[id]').forEach(function (s) { spyIO.observe(s); });
  }

  /* ── Tarjetas de módulos: expandir / contraer ────────────────── */

  doc.querySelectorAll('.module-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.module-card');
      var open = card.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      var label = btn.querySelector('.toggle-text');
      if (label) label.textContent = open ? 'Ocultar funcionalidades' : 'Ver funcionalidades';
    });
  });

  /* ── Modal: Solicitar Presentación ───────────────────────────── */

  var overlay = doc.getElementById('modal-overlay');
  var formView = doc.getElementById('modal-form-view');
  var successView = doc.getElementById('modal-success');
  var form = doc.getElementById('presentation-form');
  var lastFocus = null;

  function openModal() {
    lastFocus = doc.activeElement;
    formView.hidden = false;
    successView.hidden = true;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    doc.body.classList.add('no-scroll');
    var first = overlay.querySelector('input');
    window.setTimeout(function () { if (first) first.focus(); }, 80);
  }

  function closeModal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    doc.body.classList.remove('no-scroll');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  doc.querySelectorAll('[data-open-modal]').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });

  doc.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });

  overlay.querySelector('.modal-close').addEventListener('click', closeModal);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  /* Trampa de foco básica dentro del modal */
  overlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !overlay.classList.contains('open')) return;
    var focusables = Array.prototype.filter.call(
      overlay.querySelectorAll('button, input, select, textarea, [href]'),
      function (el) { return !el.disabled && el.offsetParent !== null; }
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && doc.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && doc.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  });

  /* Envío del formulario (simulado, sin backend) */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    formView.hidden = true;
    successView.hidden = false;
    form.reset();
    var okBtn = successView.querySelector('.btn');
    if (okBtn) okBtn.focus();
  });
})();
