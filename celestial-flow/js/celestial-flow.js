document.addEventListener("DOMContentLoaded", () => {
  initThemeSelector();
  initSidebar();
  initNavbar();
  initPanel();
  initSelect();
  initTypewriter();
  initSpotlight();
  initTextMarquee();
  initHoverIncline();
  initScrollProgress();
  initReveal();
  initParallax();
});

//theme selector ----------------------------------------------------------
const CF_THEME_KEY = "celestial-flow-theme";

const CF_THEME_GROUPS = [
  {
    title: "Light themes",
    themes: [
      ["light", "Light"],
      ["light-teal", "Light Teal"],
      ["nebula-light", "Nebula Light"],
      ["light-slate-mist", "Light Slate Mist"],
      ["paper", "Paper"],
      ["neumorphism", "Neumorphism"],
      ["glass", "Glass"],
      ["sakura", "Sakura"],
      ["coffee", "Coffee"],
      ["ink", "Ink"],
    ],
  },
  {
    title: "Dark themes",
    themes: [
      ["dark", "Dark"],
      ["dark-teal", "Dark Teal"],
      ["nebula-dark", "Nebula Dark"],
      ["dark-slate-mist", "Dark Slate Mist"],
      ["blacksteel", "Blacksteel"],
      ["forest", "Forest"],
      ["nord", "Nord"],
      ["gold", "Gold"],
    ],
  },
];

function getStoredTheme() {
  try {
    return localStorage.getItem(CF_THEME_KEY);
  } catch {
    return null;
  }
}

function isKnownTheme(theme) {
  return CF_THEME_GROUPS.some((group) =>
    group.themes.some(([value]) => value === theme),
  );
}

function getTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

function getThemeLabel(theme) {
  for (const group of CF_THEME_GROUPS) {
    const found = group.themes.find(([value]) => value === theme);
    if (found) return found[1];
  }
  return theme;
}

function setTheme(theme, { persist = true, animate = true } = {}) {
  if (!isKnownTheme(theme)) return;

  const apply = () => {
    document.documentElement.setAttribute("data-theme", theme);
    if (persist) {
      document.dispatchEvent(
        new CustomEvent("themechange", { detail: { theme } }),
      );
    }
  };

  if (persist) {
    try {
      localStorage.setItem(CF_THEME_KEY, theme);
    } catch {
    }
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (animate && !reduceMotion && document.startViewTransition) {
    document.startViewTransition(apply);
  } else {
    apply();
  }
}

(function applyStoredTheme() {
  const saved = getStoredTheme();
  if (saved && isKnownTheme(saved)) {
    document.documentElement.setAttribute("data-theme", saved);
  }
})();

//theme selector ----------------------------------------------------------------
let cfThemeSelectorCount = 0;

function initThemeSelector() {
  document.querySelectorAll(".theme-selector").forEach((selector) => {
    if (selector.dataset.ready) return;
    selector.dataset.ready = "true";

    const uid = `theme-selector-${++cfThemeSelectorCount}`;

    const groupsHTML = CF_THEME_GROUPS.map(
      (group, index) => `
      <div class="theme-selector__group" role="group" aria-labelledby="${uid}-group-${index}">
        <p class="theme-selector__group-title" id="${uid}-group-${index}">${group.title}</p>
        <div class="theme-selector__grid">
          ${group.themes
            .map(
              ([value, label]) => `
          <button class="theme-selector__item" type="button" role="option" aria-selected="false" tabindex="-1" data-value="${value}">
            <span class="theme-selector__preview" data-theme="${value}" aria-hidden="true">
              <span class="theme-selector__navbar">
                <span class="theme-selector__logo"></span>
                <span class="theme-selector__dot"></span>
                <span class="theme-selector__dot"></span>
              </span>
              <span class="theme-selector__body">
                <span class="theme-selector__title-line"></span>
                <span class="theme-selector__text-line"></span>
                <span class="theme-selector__pill"></span>
              </span>
            </span>
            <span class="theme-selector__name">${label}</span>
          </button>`,
            )
            .join("")}
        </div>
      </div>`,
    ).join("");

    selector.innerHTML = `
      <button class="theme-selector__btn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="${uid}-menu">
        <span class="theme-selector__swatch" aria-hidden="true"></span>
        <span class="theme-selector__label"></span>
      </button>
      <div class="theme-selector__menu" id="${uid}-menu" popover="manual" role="listbox" aria-label="Theme">${groupsHTML}</div>`;

    const button = selector.querySelector(".theme-selector__btn");
    const swatch = selector.querySelector(".theme-selector__swatch");
    const label = selector.querySelector(".theme-selector__label");
    const menu = selector.querySelector(".theme-selector__menu");
    const items = [...menu.querySelectorAll(".theme-selector__item")];
    const groups = [...menu.querySelectorAll(".theme-selector__grid")].map(
      (grid) => [...grid.children],
    );
    const livePreview = selector.hasAttribute("data-preview");

    let committed = getTheme();

    const isOpen = () => menu.matches(":popover-open");

    const render = (theme) => {
      swatch.setAttribute("data-theme", theme);
      label.textContent = getThemeLabel(theme);
      items.forEach((item) => {
        item.setAttribute("aria-selected", String(item.dataset.value === theme));
      });
    };

    const place = () => {
      const rect = button.getBoundingClientRect();
      const gap = 8;
      const margin = 8;
      const below = window.innerHeight - rect.bottom - gap - margin;
      const above = rect.top - gap - margin;
      const openUp = below < 320 && above > below;

      menu.style.setProperty(
        "--ts-max-h",
        `${Math.max(160, Math.floor(openUp ? above : below))}px`,
      );

      const width = menu.offsetWidth;
      const height = menu.offsetHeight;
      const left = Math.max(
        margin,
        Math.min(rect.left, window.innerWidth - width - margin),
      );

      menu.style.left = `${Math.round(left)}px`;
      menu.style.top = `${Math.round(openUp ? rect.top - gap - height : rect.bottom + gap)}px`;
    };

    const revertPreview = () => {
      if (getTheme() !== committed) {
        setTheme(committed, { persist: false, animate: false });
      }
    };

    const open = () => {
      if (isOpen()) return;

      menu.showPopover();
      button.setAttribute("aria-expanded", "true");
      selector.setAttribute("data-open", "");
      place();

      const current =
        items.find((item) => item.dataset.value === committed) || items[0];
      current.focus({ preventScroll: true });
      current.scrollIntoView({ block: "center" });

      window.addEventListener("resize", place);
      window.addEventListener("scroll", place, true);
    };

    const close = (returnFocus = true, revert = true) => {
      if (!isOpen()) return;

      menu.hidePopover();
      button.setAttribute("aria-expanded", "false");
      selector.removeAttribute("data-open");
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);

      if (revert) revertPreview();
      if (returnFocus) button.focus();
    };

    const choose = (theme) => {
      const alreadyShowing = getTheme() === theme;
      committed = theme;
      setTheme(theme, { animate: !alreadyShowing });
      render(theme);
      close(true, false);
    };

    const move = (key, current) => {
      const flat = groups.flat();
      const groupIndex = groups.findIndex((group) => group.includes(current));
      const group = groups[groupIndex];
      const position = group.indexOf(current);
      const cols = getComputedStyle(current.parentElement)
        .gridTemplateColumns.split(" ").length;

      switch (key) {
        case "ArrowRight":
          return flat[Math.min(flat.indexOf(current) + 1, flat.length - 1)];
        case "ArrowLeft":
          return flat[Math.max(flat.indexOf(current) - 1, 0)];
        case "ArrowDown": {
          if (position + cols < group.length) return group[position + cols];
          const next = groups[groupIndex + 1];
          return next ? next[Math.min(position % cols, next.length - 1)] : current;
        }
        case "ArrowUp": {
          if (position - cols >= 0) return group[position - cols];
          const prev = groups[groupIndex - 1];
          if (!prev) return current;
          const lastRow = Math.floor((prev.length - 1) / cols) * cols;
          return prev[Math.min(lastRow + (position % cols), prev.length - 1)];
        }
        case "Home":
          return flat[0];
        case "End":
          return flat[flat.length - 1];
        default:
          return undefined;
      }
    };

    button.addEventListener("click", () => (isOpen() ? close() : open()));

    button.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        open();
      }
    });

    items.forEach((item) => {
      item.addEventListener("click", () => choose(item.dataset.value));

      if (livePreview) {
        const show = () =>
          setTheme(item.dataset.value, { persist: false, animate: false });
        item.addEventListener("pointerenter", show);
        item.addEventListener("focus", show);
      }
    });

    if (livePreview) {
      menu.addEventListener("pointerleave", revertPreview);
    }

    menu.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        close(false);
        return;
      }

      const current = document.activeElement.closest(".theme-selector__item");
      if (!current) return;

      const next = move(event.key, current);
      if (next) {
        event.preventDefault();
        next.focus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        event.preventDefault();
        close();
      }
    });

    document.addEventListener("pointerdown", (event) => {
      if (isOpen() && !selector.contains(event.target)) close(false);
    });

    document.addEventListener("themechange", (event) => {
      committed = event.detail.theme;
      render(committed);
    });

    render(committed);
  });
}

//initSelect -------------------------------------------------------------------
function initSelect() {
  const selects = document.querySelectorAll(".select");

  selects.forEach((select) => {
    if (select.dataset.initialized) return;
    select.dataset.initialized = "true";

    const button = select.querySelector(".select__btn");
    const options = select.querySelectorAll(".select__item");

    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const updatePosition = () => {
      const menu = select.querySelector(".select__menu");

      if (!(menu instanceof HTMLElement)) {
        return;
      }

      const buttonRect = button.getBoundingClientRect();
      const menuHeight = menu.offsetHeight;
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        select.setAttribute("data-position", "top");
      } else {
        select.setAttribute("data-position", "bottom");
      }
    };

    button.addEventListener("click", () => {
      select.toggleAttribute("data-open");

      if (select.hasAttribute("data-open")) {
        requestAnimationFrame(updatePosition);
      }
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        const value = option.dataset.value;
        const label = option.textContent.trim();

        if (value === undefined) {
          return;
        }

        options.forEach((item) => {
          item.removeAttribute("data-selected");
        });
        option.setAttribute("data-selected", "");

        select.dataset.value = value;
        button.textContent = label;

        select.removeAttribute("data-open");
        select.dispatchEvent(new CustomEvent("selectchange"));
      });
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof Node && !select.contains(target)) {
        select.removeAttribute("data-open");
      }
    });
  });
}
//sidebar -----------------------------------------------------------------
function initSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.querySelector(".sidebar__toggle");

  if (
    !(sidebar instanceof HTMLElement) ||
    !(toggle instanceof HTMLButtonElement)
  ) {
    return;
  }

  if (toggle.dataset.sidebarBound) {
    return;
  }
  toggle.dataset.sidebarBound = "true";

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    toggle.classList.toggle("active");
  });

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (
      target instanceof Node &&
      sidebar.classList.contains("active") &&
      !sidebar.contains(target) &&
      !toggle.contains(target)
    ) {
      sidebar.classList.remove("active");
      toggle.classList.remove("active");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      sidebar.classList.remove("active");
      toggle.classList.remove("active");
    }
  });
}

//navbar --------------------------------------------------------------
function initNavbar() {
  const navbar = document.querySelector(".navbar__menu");
  const toggle = document.querySelector(".navbar__toggle");

  if (
    !(navbar instanceof HTMLElement) ||
    !(toggle instanceof HTMLButtonElement)
  ) {
    return;
  }

  toggle.addEventListener("click", () => {
    navbar.classList.toggle("active");
    toggle.classList.toggle("active");
  });

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (
      target instanceof Node &&
      navbar.classList.contains("active") &&
      !navbar.contains(target) &&
      !toggle.contains(target)
    ) {
      navbar.classList.remove("active");
      toggle.classList.remove("active");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      navbar.classList.remove("active");
      toggle.classList.remove("active");
    }
  });
}

//panel --------------------------------------------------------------------
function initPanel() {
  const panels = document.querySelectorAll(".panel-left, .panel-right");

  panels.forEach((panel) => {
    const toggle = panel.querySelector(".panel-toggle");

    if (
      !(panel instanceof HTMLElement) ||
      !(toggle instanceof HTMLButtonElement)
    ) {
      return;
    }

    const updateToggle = () => {
      const isClosed = panel.classList.contains("closed");
      const isLeft = panel.classList.contains("panel-left");

      toggle.textContent = isLeft
        ? isClosed
          ? "❯"
          : "❮"
        : isClosed
          ? "❮"
          : "❯";

      toggle.setAttribute("aria-expanded", String(!isClosed));
    };

    updateToggle();

    toggle.addEventListener("click", () => {
      panel.classList.toggle("closed");
      updateToggle();
    });
  });
}

//toast -----------------------------------------------------------
function showToast(message, duration = 3000) {
  const toast = document.createElement("div");

  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}

window.CelestialFlow = { showToast };


//typewriter ----------------------------------------------------------------
function initTypewriter() {
  document.querySelectorAll(".text-writer[data-words]").forEach((el) => {
    if (el.dataset.ready) return;

    const words = el.dataset.words
      .split(",")
      .map((word) => word.trim())
      .filter(Boolean);
    if (!words.length) return;
    el.dataset.ready = "true";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = words[0];
      return;
    }

    const readTime = (name, fallback) => {
      const raw = getComputedStyle(el).getPropertyValue(name).trim();
      const value = parseFloat(raw);
      if (Number.isNaN(value)) return fallback;
      return raw.endsWith("ms") ? value : value * 1000;
    };

    const speed = readTime("--speed", 80);
    const hold = readTime("--hold", 1500);
    const delay = readTime("--delay", 0);
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const whenVisible = () =>
      new Promise((resolve) => {
        const observer = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            resolve();
          }
        });
        observer.observe(el);
      });

    (async () => {
      await whenVisible();
      await sleep(delay);

      let index = 0;
      while (el.isConnected) {
        const letters = Array.from(words[index]);

        for (let i = 1; i <= letters.length; i++) {
          el.textContent = letters.slice(0, i).join("");
          await sleep(speed);
        }

        await sleep(hold);

        for (let i = letters.length - 1; i >= 0; i--) {
          el.textContent = letters.slice(0, i).join("");
          await sleep(speed / 2);
        }

        await sleep(speed * 4);
        index = (index + 1) % words.length;
      }
    })();
  });
}


//initSpotlight -------------------------------------------------------------------
//.hover-spotlight
let spotlightListening = false;
function initSpotlight() {
  const ensureLayer = (host) => {
    if (host.querySelector(":scope > .spotlight")) return;
    const layer = document.createElement("span");
    layer.className = "spotlight";
    layer.setAttribute("aria-hidden", "true");
    host.append(layer);
  };

  document.querySelectorAll(".hover-spotlight").forEach(ensureLayer);

  if (spotlightListening) return;
  spotlightListening = true;

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      const host = event.target instanceof Element ? event.target.closest(".hover-spotlight") : null;
      if (!host) return;
      ensureLayer(host);
      const rect = host.getBoundingClientRect();
      host.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      host.style.setProperty("--my", `${event.clientY - rect.top}px`);
    },
    { passive: true }
  );
}

//initTextMarquee -----------------------------------------------------------------
function initTextMarquee() {
  document.querySelectorAll(".text-marquee").forEach((el) => {
    if (el.dataset.textMarqueeBound) return;
    el.dataset.textMarqueeBound = "true";
    const track = document.createElement("div");
    track.className = "text-marquee__track";
    track.append(...el.children);
    [...track.children].forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.append(clone);
    });
    el.append(track);
  });
}


//hoverInclineListening -----------------------------------------------------------------
let hoverInclineListening = false;

function initHoverIncline() {
  if (hoverInclineListening) return;
  hoverInclineListening = true;

  let active = null;
  const reset = (el) => {
    el.style.removeProperty("--hover-incline-x");
    el.style.removeProperty("--hover-incline-y");
  };

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      const host = event.target instanceof Element ? event.target.closest(".hover-incline") : null;
      if (active && active !== host) reset(active);
      active = host;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      host.style.setProperty("--hover-incline-x", ((event.clientX - rect.left) / rect.width - 0.5) * 2);
      host.style.setProperty("--hover-incline-y", ((event.clientY - rect.top) / rect.height - 0.5) * 2);
    },
    { passive: true }
  );

  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget && active) {
      reset(active);
      active = null;
    }
  });
}

//initScrollProgress -----------------------------------------------------------------
function initScrollProgress() {
  if (CSS.supports("animation-timeline: scroll()")) return;
  const bars = document.querySelectorAll(".scroll-progress");
  if (!bars.length) return;

  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? doc.scrollTop / max : 0;
    bars.forEach((bar) => {
      bar.style.transform = `scaleX(${ratio})`;
    });
  };

  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();
}

//initReveal -------------------------------------------------------------------
const revealHandled = new WeakSet();

function initReveal() {
  if (typeof CSSAnimation === "undefined" || !("IntersectionObserver" in window)) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const waiting = new Map();

  document.getAnimations().forEach((animation) => {
    if (!(animation instanceof CSSAnimation) || animation.timeline !== document.timeline || revealHandled.has(animation)) return;
    revealHandled.add(animation);

    const effect = animation.effect;
    const target = effect && effect.target;
    if (!(target instanceof Element) || effect.pseudoElement) return;
    if (target.closest('[data-reveal="off"]')) return;

    const timing = effect.getComputedTiming();
    const isEntrance = timing.iterations === 1 && (timing.fill === "both" || timing.fill === "backwards");
    if (!isEntrance) return;

    const rect = target.getBoundingClientRect();
    if (rect.top < innerHeight && rect.bottom > 0) return;

    animation.pause();
    animation.currentTime = 0;
    if (!waiting.has(target)) waiting.set(target, []);
    waiting.get(target).push(animation);
  });

  if (!waiting.size) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        waiting.get(entry.target).forEach((animation) => animation.play());
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px" }
  );

  waiting.forEach((_, target) => observer.observe(target));
}


//initParallax -------------------------------------------------------------------
let parallaxListening = false;
function initParallax() {
  if (parallaxListening) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  parallaxListening = true;

  let frame = 0;
  let x = 0;
  let y = 0;

  const update = () => {
    frame = 0;
    document.querySelectorAll(".hover-parallax").forEach((host) => {
      const rect = host.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const px = Math.max(-0.5, Math.min(0.5, (x - rect.left) / rect.width - 0.5));
      const py = Math.max(-0.5, Math.min(0.5, (y - rect.top) / rect.height - 0.5));
      host.style.setProperty("--fx-px", px.toFixed(3));
      host.style.setProperty("--fx-py", py.toFixed(3));
    });
  };

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(update);
    },
    { passive: true }
  );
}