/* =========================
   Mi portafolio - JS
   ========================= */

/* ---------- Helpers ---------- */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/* ---------- DOM Ready ---------- */
document.addEventListener("DOMContentLoaded", () => {
  setFooterYear();
  setupSmoothScrollAndActiveNav();
  setupTyping();
  setupProjectFilters();
  setupProjectModal();
  setupContactFormValidation();
  setupTiltCards();
  setupGSAPAnimations();
});

/* ---------- Footer Year ---------- */
function setFooterYear() {
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Smooth Scroll + Active Nav ---------- */
function setupSmoothScrollAndActiveNav() {
  const navLinks = $$("a[data-nav]");
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  // Smooth scrolling
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      // Cierra el menú móvil (Bootstrap) si está abierto
      const navMenu = $("#navMenu");
      if (navMenu && navMenu.classList.contains("show")) {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navMenu);
        bsCollapse.hide();
      }
    });
  });

  // Active link on scroll (IntersectionObserver)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = #${entry.target.id};
        navLinks.forEach((a) => {
          const isActive = a.getAttribute("href") === id;
          a.classList.toggle("active", isActive);
        });
      });
    },
    {
      root: null,
      threshold: 0.55,
    }
  );

  sections.forEach((sec) => observer.observe(sec));
}

/* ---------- Typing Effect ---------- */
function setupTyping() {
  const typingEl = $("#typing");
  if (!typingEl) return;

  const phrases = [
    "Desarrolladora Front-End",
    "Aprendiz de Java (poo)",
    "Aprendiz Bases de datos",
    "Resolución de problemas",
    "Buenas practicas en Git",
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typeSpeed = 60;
  const deleteSpeed = 35;
  const pauseAfterType = 900;
  const pauseAfterDelete = 300;

  function tick() {
    const currentPhrase = phrases[phraseIndex];
    const visibleText = currentPhrase.slice(0, charIndex);

    typingEl.textContent = visibleText;

    if (!isDeleting) {
      if (charIndex < currentPhrase.length) {
        charIndex++;
        setTimeout(tick, typeSpeed);
      } else {
        isDeleting = true;
        setTimeout(tick, pauseAfterType);
      }
    } else {
      if (charIndex > 0) {
        charIndex--;
        setTimeout(tick, deleteSpeed);
      } else {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, pauseAfterDelete);
      }
    }
  }

  tick();
}

/* ---------- Projects: Filters ---------- */
function setupProjectFilters() {
  const filterButtons = $$(".filter-btn");
  const items = $$(".project-item");

  if (!filterButtons.length || !items.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      // Active UI
      filterButtons.forEach((b) => b.classList.toggle("active", b === btn));

      // Filter items
      items.forEach((item) => {
        const categories = (item.dataset.category || "").split(" ");
        const shouldShow = filter === "all" || categories.includes(filter);

        item.classList.toggle("is-hidden", !shouldShow);
      });

      // Optional: animate grid on filter
      if (window.gsap) {
        gsap.fromTo(
          "#projectsGrid",
          { opacity: 0.7, y: 6 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
        );
      }
    });
  });
}

/* ---------- Projects: Modal ---------- */
function setupProjectModal() {
  const modalEl = $("#projectModal");
  if (!modalEl) return;

  const modalTitle = $("#modalTitle");
  const modalDesc = $("#modalDesc");
  const modalTech = $("#modalTech");
  const modalGithub = $("#modalGithub");
  const modalDemo = $("#modalDemo");

  const bsModal = new bootstrap.Modal(modalEl);

  const openButtons = $$("[data-open-modal]");
  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title || "Proyecto";
      const desc = btn.dataset.desc || "Sin descripción.";
      const tech = btn.dataset.tech || "Tech";
      const github = btn.dataset.github || "#";
      const demo = btn.dataset.demo || "";

      if (modalTitle) modalTitle.textContent = title;
      if (modalDesc) modalDesc.textContent = desc;

      if (modalTech) modalTech.textContent = tech;

      if (modalGithub) {
        modalGithub.href = github;
        modalGithub.style.display = github && github !== "#" ? "inline-flex" : "none";
      }

      if (modalDemo) {
        if (demo && demo !== "#") {
          modalDemo.href = demo;
          modalDemo.style.display = "inline-flex";
        } else {
          modalDemo.style.display = "none";
        }
      }

      bsModal.show();
    });
  });
}

/* ---------- Contact Form Validation ---------- */
function setupContactFormValidation() {
  const form = $("#contactForm");
  if (!form) return;

  const nameInput = $("#name");
  const emailInput = $("#email");
  const messageInput = $("#message");
  const statusEl = $("#formStatus");

  const isEmailValid = (email) => {
    // simple y efectivo para frontend
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(String(email).trim());
  };

  const setStatus = (msg, ok = true) => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.toggle("text-success", ok);
    statusEl.classList.toggle("text-danger", !ok);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Reset status
    setStatus("");

    const name = (nameInput?.value || "").trim();
    const email = (emailInput?.value || "").trim();
    const message = (messageInput?.value || "").trim();

    // Validación custom + Bootstrap feedback
    let valid = true;

    if (!name) {
      valid = false;
      nameInput?.classList.add("is-invalid");
    } else {
      nameInput?.classList.remove("is-invalid");
      nameInput?.classList.add("is-valid");
    }

    if (!email || !isEmailValid(email)) {
      valid = false;
      emailInput?.classList.add("is-invalid");
    } else {
      emailInput?.classList.remove("is-invalid");
      emailInput?.classList.add("is-valid");
    }

    if (!message || message.length < 10) {
      valid = false;
      messageInput?.classList.add("is-invalid");
    } else {
      messageInput?.classList.remove("is-invalid");
      messageInput?.classList.add("is-valid");
    }

    if (!valid) {
      setStatus("Revisa los campos marcados. Faltan datos o hay errores.", false);
      return;
    }

    // Aquí podrías integrarlo con EmailJS / backend (más adelante).
    // Por ahora: feedback y reset.
    setStatus("Mensaje listo. (Luego conectamos envío real).", true);

    // Reset suave
    setTimeout(() => {
      form.reset();
      [nameInput, emailInput, messageInput].forEach((el) => {
        if (!el) return;
        el.classList.remove("is-valid", "is-invalid");
      });
      setStatus("");
    }, 1400);
  });

  // Validación en vivo (opcional)
  [nameInput, emailInput, messageInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      input.classList.remove("is-invalid");
    });
  });
}

/* ---------- Tilt 3D (sin librerías) ---------- */
function setupTiltCards() {
  const tiltEls = $$("[data-tilt]");
  if (!tiltEls.length) return;

  const maxTilt = 10;     // grados
  const scale = 1.02;
  const perspective = 900;

  tiltEls.forEach((el) => {
    el.style.transformStyle = "preserve-3d";
    el.style.transition = "transform 180ms ease";

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const midX = rect.width / 2;
      const midY = rect.height / 2;

      const rotY = ((x - midX) / midX) * maxTilt;
      const rotX = -((y - midY) / midY) * maxTilt;

      el.style.transform = perspective(${perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale});
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1);
    });
  });
}

/* ---------- GSAP Animations (Reveal + Hero) ---------- */
function setupGSAPAnimations() {
  if (!window.gsap) return;

  // Register plugin
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // Quick hero entrance
  gsap.from(".hero-left", {
    opacity: 0,
    y: 12,
    duration: 0.8,
    ease: "power2.out",
    delay: 0.1,
  });

  gsap.from(".hero-right", {
    opacity: 0,
    y: 12,
    duration: 0.9,
    ease: "power2.out",
    delay: 0.2,
  });

  // Scroll reveal for elements with data-animate
  const animEls = $$("[data-animate]");
  animEls.forEach((el) => {
    const type = el.dataset.animate || "fade-up";

    const baseFrom = { opacity: 0 };
    const baseTo = { opacity: 1, duration: 0.7, ease: "power2.out" };

    let fromVars = { ...baseFrom };
    let toVars = { ...baseTo };

    if (type === "fade-up") fromVars.y = 14;
    if (type === "zoom-in") {
      fromVars.scale = 0.96;
      fromVars.y = 10;
    }

    gsap.fromTo(el, fromVars, {
      ...toVars,
      scrollTrigger: {
        trigger: el,
        start: "top 86%",
        toggleActions: "play none none reverse",
      },
    });
  });

  // Optional: subtle parallax on glow layers
  const bgGlow = document.querySelector(".bg-glow");
  if (bgGlow) {
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      gsap.to(bgGlow, { x, y, duration: 0.6, ease: "power2.out" });
    });
  }
}