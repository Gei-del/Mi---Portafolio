(() => {
  'use strict';

  const body = document.body;
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const recruiterToggle = document.getElementById('recruiterToggle');
  const filterButtons = [...document.querySelectorAll('.filter-btn')];
  const projectCards = [...document.querySelectorAll('.project-card')];
  const copyEmailButton = document.getElementById('copyEmail');
  const toast = document.getElementById('toast');
  const year = document.getElementById('year');
  const navLinks = [...document.querySelectorAll('.main-nav a')];

  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  const closeMenu = () => {
    if (!mainNav || !menuToggle) return;
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = '<i class="bi bi-list"></i>';
  };

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.innerHTML = isOpen
        ? '<i class="bi bi-x-lg"></i>'
        : '<i class="bi bi-list"></i>';
    });

    navLinks.forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  // Reveal on scroll
  const revealElements = [...document.querySelectorAll('.reveal')];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // Project filters
  const applyFilter = filter => {
    projectCards.forEach(card => {
      const categories = (card.dataset.category || '').split(' ');
      const shouldShow = filter === 'all' || categories.includes(filter);
      card.classList.toggle('is-hidden', !shouldShow);
    });
  };

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      filterButtons.forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      applyFilter(filter);
    });
  });

  // Recruiter mode: removes decorative friction and keeps the key evidence visible.
  const recruiterStorageKey = 'lorena-portfolio-recruiter-mode';

  const setRecruiterMode = enabled => {
    body.classList.toggle('recruiter-mode', enabled);

    if (recruiterToggle) {
      recruiterToggle.setAttribute('aria-pressed', String(enabled));
      recruiterToggle.innerHTML = enabled
        ? '<i class="bi bi-x-circle"></i><span>Salir del modo reclutador</span>'
        : '<i class="bi bi-briefcase"></i><span>Modo reclutador</span>';
    }

    if (enabled) {
      applyFilter('all');
      filterButtons.forEach((button, index) => button.classList.toggle('active', index === 0));
    }

    try {
      sessionStorage.setItem(recruiterStorageKey, String(enabled));
    } catch (_) {
      // Storage may be blocked; the mode still works for the current page.
    }
  };

  try {
    const savedMode = sessionStorage.getItem(recruiterStorageKey) === 'true';
    setRecruiterMode(savedMode);
  } catch (_) {
    setRecruiterMode(false);
  }

  recruiterToggle?.addEventListener('click', () => {
    setRecruiterMode(!body.classList.contains('recruiter-mode'));
  });

  // Keyboard shortcut: R toggles recruiter mode when the user is not typing.
  document.addEventListener('keydown', event => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
    if (!isTyping && event.key.toLowerCase() === 'r' && !event.metaKey && !event.ctrlKey && !event.altKey) {
      setRecruiterMode(!body.classList.contains('recruiter-mode'));
    }
  });

  // Copy email interaction
  let toastTimer;
  const showToast = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2200);
  };

  copyEmailButton?.addEventListener('click', async () => {
    const email = copyEmailButton.dataset.email;
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copiado');
    } catch (_) {
      const textarea = document.createElement('textarea');
      textarea.value = email;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      showToast('Email copiado');
    }
  });

  // Active navigation state based on the visible section.
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      const activeId = `#${visible.target.id}`;
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === activeId));
    }, { threshold: [0.2, 0.45, 0.65], rootMargin: '-20% 0px -55% 0px' });

    sections.forEach(section => sectionObserver.observe(section));
  }
})();
