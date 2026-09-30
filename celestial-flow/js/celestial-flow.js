document.addEventListener("DOMContentLoaded", () => {
  initThemeSelector()
  initSidebar();
  initNavbar();
  initPanel();
  setTimeout(() => { initThemeSelector();initSelect(); }, 100);
});

//theme selector ----------------------------------------------------------
function initThemeSelector() {
  const selectors = document.querySelectorAll(".theme-selector");
  const savedTheme = localStorage.getItem("celestial-flow-theme");

  selectors.forEach((selector) => {
    const button = selector.querySelector(".select__btn");
    const options = selector.querySelectorAll(".select__item");
    if (!(button instanceof HTMLButtonElement)) { return; }

    const setTheme = (theme) => {
      const option = selector.querySelector(`.select__item[data-value="${theme}"]`);

      if (!(option instanceof HTMLElement)) {
        return;
      }

      const label = option.querySelector(".theme-name");

      selector.dataset.value = theme;
      button.textContent = label?.textContent.trim() || option.textContent.trim();

      options.forEach((item) => {
        item.removeAttribute("data-selected");
      });

      option.setAttribute("data-selected", "");

      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("celestial-flow-theme", theme);

      selectors.forEach((s) => {
        if (s === selector) {
          return;
        }

        const otherButton = s.querySelector(".select__btn");
        const otherOptions = s.querySelectorAll(".select__item");
        const otherOption = s.querySelector(`.select__item[data-value="${theme}"]`);

        if (!(otherButton instanceof HTMLButtonElement) || !(otherOption instanceof HTMLElement)) {
          return;
        }

        const otherLabel = otherOption.querySelector(".theme-name");

        s.dataset.value = theme;
        otherButton.textContent = otherLabel?.textContent.trim() || otherOption.textContent.trim();

        otherOptions.forEach((item) => {
          item.removeAttribute("data-selected");
        });

        otherOption.setAttribute("data-selected", "");
      });
    };

    if (savedTheme) {
      setTheme(savedTheme);
    }

    selector.addEventListener("selectchange", () => {
      const theme = selector.dataset.value;

      if (theme) {
        setTheme(theme);
      }
    });
  });
}

//sidebar -----------------------------------------------------------------
function initSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.querySelector(".sidebar__toggle");

  if (!(sidebar instanceof HTMLElement) || !(toggle instanceof HTMLButtonElement)) { return; }

  if (toggle.dataset.sidebarBound) { return; }
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

  if (!(navbar instanceof HTMLElement) || !(toggle instanceof HTMLButtonElement)) {
    return;
  }

  toggle.addEventListener("click", () => {
    navbar.classList.toggle("active");
    toggle.classList.toggle("active");
  });

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (target instanceof Node && navbar.classList.contains("active") && !navbar.contains(target) && !toggle.contains(target)) {
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

//sidebar -----------------------------------------------------------------
function initSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.querySelector(".sidebar__toggle");

  if (!(sidebar instanceof HTMLElement) || !(toggle instanceof HTMLButtonElement)) { return; }

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

//panel --------------------------------------------------------------------
function initPanel() {
  const panels = document.querySelectorAll(".panel-left, .panel-right");

  panels.forEach((panel) => {
    const toggle = panel.querySelector(".panel-toggle");

    if (!(panel instanceof HTMLElement) || !(toggle instanceof HTMLButtonElement)) {
      return;
    }

    const updateToggle = () => {
      const isClosed = panel.classList.contains("closed");
      const isLeft = panel.classList.contains("panel-left");

      toggle.textContent = isLeft
        ? (isClosed ? "❯" : "❮")
        : (isClosed ? "❮" : "❯");

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