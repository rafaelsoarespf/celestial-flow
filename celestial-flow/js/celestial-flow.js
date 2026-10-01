document.addEventListener("DOMContentLoaded", () => {
  initThemeSelector();
  initSidebar();
  initNavbar();
  initPanel();
  initThemePicker();
});

//theme selector ----------------------------------------------------------
//theme ---------------------------------------------------------------------
const CF_THEME_KEY = "celestial-flow-theme";

// Single source of truth for the picker. To add a theme: add it here and in themes.css.
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

// persist: save in localStorage and notify (the "themechange" event).
// animate: cross-fade with the View Transitions API when supported.
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
      /* storage unavailable: the theme just won't be remembered */
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

// Applies the saved theme as soon as this script runs. For zero flash on load,
// also add the inline snippet to <head> (see the docs).
(function applyStoredTheme() {
  const saved = getStoredTheme();
  if (saved && isKnownTheme(saved)) {
    document.documentElement.setAttribute("data-theme", saved);
  }
})();

//theme picker ----------------------------------------------------------------
let cfThemePickerCount = 0;

function initThemePicker() {
  document.querySelectorAll(".theme-picker").forEach((picker) => {
    if (picker.dataset.ready) return;
    picker.dataset.ready = "true";

    const uid = `theme-picker-${++cfThemePickerCount}`;

    const groupsHTML = CF_THEME_GROUPS.map(
      (group, index) => `
      <div class="theme-picker__group" role="group" aria-labelledby="${uid}-group-${index}">
        <p class="theme-picker__group-title" id="${uid}-group-${index}">${group.title}</p>
        <div class="theme-picker__grid">
          ${group.themes
            .map(
              ([value, label]) => `
          <button class="theme-picker__item" type="button" role="option" aria-selected="false" tabindex="-1" data-value="${value}">
            <span class="theme-picker__preview" data-theme="${value}" aria-hidden="true">
              <span class="theme-picker__navbar">
                <span class="theme-picker__logo"></span>
                <span class="theme-picker__dot"></span>
                <span class="theme-picker__dot"></span>
              </span>
              <span class="theme-picker__body">
                <span class="theme-picker__title-line"></span>
                <span class="theme-picker__text-line"></span>
                <span class="theme-picker__pill"></span>
              </span>
            </span>
            <span class="theme-picker__name">${label}</span>
          </button>`,
            )
            .join("")}
        </div>
      </div>`,
    ).join("");

    picker.innerHTML = `
      <button class="theme-picker__btn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="${uid}-menu">
        <span class="theme-picker__swatch" aria-hidden="true"></span>
        <span class="theme-picker__label"></span>
      </button>
      <div class="theme-picker__menu" id="${uid}-menu" popover="manual" role="listbox" aria-label="Theme">${groupsHTML}</div>`;

    const button = picker.querySelector(".theme-picker__btn");
    const swatch = picker.querySelector(".theme-picker__swatch");
    const label = picker.querySelector(".theme-picker__label");
    const menu = picker.querySelector(".theme-picker__menu");
    const items = [...menu.querySelectorAll(".theme-picker__item")];
    const groups = [...menu.querySelectorAll(".theme-picker__grid")].map(
      (grid) => [...grid.children],
    );
    const livePreview = picker.hasAttribute("data-preview");

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
        "--tp-max-h",
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
      picker.setAttribute("data-open", "");
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
      picker.removeAttribute("data-open");
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

      const current = document.activeElement.closest(".theme-picker__item");
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
      if (isOpen() && !picker.contains(event.target)) close(false);
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
