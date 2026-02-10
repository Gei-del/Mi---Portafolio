/* =========================
   Portafolio Profesional JS - Lorena Pontón
   ========================= */

/* ---------- Helpers ---------- */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

/* ---------- DOM Ready ---------- */
document.addEventListener("DOMContentLoaded", () => {
  setFooterYear();
  setupSmoothScrollAndActiveNav();
  setupProjectFilters();
  setupProjectModal();
  setupTiltCards();
  setupGSAPAnimations();
  setupScrollToTop();
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
      
      // Offset for sticky header
      const headerHeight = $(".site-header")?.offsetHeight || 70;
      const targetPosition = target.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });

      // Close mobile menu if open
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

        const id = `#${entry.target.id}`;
        navLinks.forEach((a) => {
          const isActive = a.getAttribute("href") === id;
          a.classList.toggle("active", isActive);
        });
      });
    },
    {
      root: null,
      threshold: 0.5,
      rootMargin: "-80px 0px -80% 0px"
    }
  );

  sections.forEach((sec) => observer.observe(sec));
}

/* ---------- Projects: Filters ---------- */
function setupProjectFilters() {
  const filterButtons = $$(".filter-btn");
  const items = $$(".project-item");

  if (!filterButtons.length || !items.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      // Update active state
      filterButtons.forEach((b) => b.classList.toggle("active", b === btn));

      // Filter items with animation
      items.forEach((item, index) => {
        const categories = (item.dataset.category || "").split(" ");
        const shouldShow = filter === "all" || categories.includes(filter);

        if (shouldShow) {
          item.classList.remove("is-hidden");
          // Stagger animation
          if (window.gsap) {
            gsap.fromTo(
              item,
              { opacity: 0, y: 20 },
              { 
                opacity: 1, 
                y: 0, 
                duration: 0.4, 
                delay: index * 0.05,
                ease: "power2.out" 
              }
            );
          }
        } else {
          item.classList.add("is-hidden");
        }
      });
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

  const bsModal = new bootstrap.Modal(modalEl);

  const openButtons = $$("[data-open-modal]");
  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title || "Proyecto";
      const desc = btn.dataset.desc || "Sin descripción.";
      const tech = btn.dataset.tech || "Tecnologías no especificadas";
      const github = btn.dataset.github || "#";

      if (modalTitle) modalTitle.textContent = title;
      if (modalDesc) modalDesc.textContent = desc;
      if (modalTech) modalTech.textContent = tech;

      if (modalGithub) {
        modalGithub.href = github;
        modalGithub.style.display = github && github !== "#" ? "inline-flex" : "none";
      }

      bsModal.show();
    });
  });
}

/* ---------- Tilt 3D Effect ---------- */
function setupTiltCards() {
  const tiltEls = $$("[data-tilt]");
  if (!tiltEls.length) return;

  const maxTilt = 8;
  const scale = 1.03;
  const perspective = 1000;

  tiltEls.forEach((el) => {
    el.style.transformStyle = "preserve-3d";
    el.style.transition = "transform 200ms ease-out";

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const midX = rect.width / 2;
      const midY = rect.height / 2;

      const rotY = ((x - midX) / midX) * maxTilt;
      const rotX = -((y - midY) / midY) * maxTilt;

      el.style.transform = `perspective(${perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
    });
  });
}

/* ---------- GSAP Animations ---------- */
function setupGSAPAnimations() {
  if (!window.gsap) return;

  // Register plugin
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  gsap.from(".hero-left > *", {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.1,
    ease: "power2.out",
    delay: 0.2
  });

  gsap.from(".hero-right", {
    opacity: 0,
    scale: 0.95,
    duration: 1,
    ease: "power2.out",
    delay: 0.3
  });

  // Scroll reveal for elements with data-animate
  const animEls = $$("[data-animate]");
  animEls.forEach((el) => {
    const type = el.dataset.animate || "fade-up";

    let fromVars = { opacity: 0 };
    const toVars = { 
      opacity: 1, 
      duration: 0.8, 
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse",
        once: false
      }
    };

    if (type === "fade-up") {
      fromVars.y = 20;
      toVars.y = 0;
    }
    if (type === "zoom-in") {
      fromVars.scale = 0.95;
      toVars.scale = 1;
    }

    gsap.fromTo(el, fromVars, toVars);
  });

  // Parallax effect on background glow
  const bgGlow = $(".bg-glow");
  if (bgGlow) {
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      gsap.to(bgGlow, { x, y, duration: 1, ease: "power2.out" });
    });
  }

  // Navbar scroll effect
  const header = $(".site-header");
  if (header) {
    ScrollTrigger.create({
      start: "top -50",
      end: 99999,
      toggleClass: { targets: header, className: "scrolled" },
      onUpdate: (self) => {
        if (self.direction === -1) {
          gsap.to(header, { y: 0, duration: 0.3 });
        } else if (self.progress > 0.05) {
          gsap.to(header, { y: -100, duration: 0.3 });
        }
      }
    });
  }
}

/* ---------- Scroll to Top Button ---------- */
function setupScrollToTop() {
  // Create button if doesn't exist
  let scrollBtn = $("#scrollTopBtn");
  
  if (!scrollBtn) {
    scrollBtn = document.createElement("button");
    scrollBtn.id = "scrollTopBtn";
    scrollBtn.className = "scroll-top-btn";
    scrollBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    scrollBtn.setAttribute("aria-label", "Volver arriba");
    document.body.appendChild(scrollBtn);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      .scroll-top-btn {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--accent);
        color: #000;
        border: none;
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.2rem;
        box-shadow: 0 4px 20px rgba(76, 201, 240, 0.4);
        transition: all 0.3s ease;
        z-index: 999;
      }
      .scroll-top-btn.show {
        display: flex;
      }
      .scroll-top-btn:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(76, 201, 240, 0.6);
      }
    `;
    document.head.appendChild(style);
  }

  // Show/hide on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      scrollBtn.classList.add("show");
    } else {
      scrollBtn.classList.remove("show");
    }
  });

  // Scroll to top on click
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

/* ---------- Performance: Lazy Load Images ---------- */
document.addEventListener("DOMContentLoaded", () => {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          imageObserver.unobserve(img);
        }
      });
    });

    $$("img[data-src]").forEach((img) => imageObserver.observe(img));
  }
});

/* ---------- Console Message for Recruiters ---------- */
console.log(
  "%c👋 Hola Reclutador!",
  "font-size: 24px; font-weight: bold; color: #4cc9f0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);"
);
console.log(
  "%cGracias por revisar mi portafolio. Este sitio fue desarrollado con:",
  "font-size: 14px; color: #9fb0c3;"
);
console.log(
  "%c• HTML5, CSS3, JavaScript\n• Bootstrap 5\n• GSAP para animaciones\n• Diseño responsivo mobile-first",
  "font-size: 13px; color: #e6edf3; line-height: 1.6;"
);
console.log(
  "%c💼 ¿Hablamos? → pontongeidy@gmail.com",
  "font-size: 15px; font-weight: bold; color: #4cc9f0;"
);