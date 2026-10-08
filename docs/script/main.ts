document.addEventListener("DOMContentLoaded", init);

function init(): void {
  initSidebar();
  initThemeGallery();
  initHeroThemes();
}

declare global {
  interface Window {
    initThemeSelector: () => void;
    initSelect: () => void;
    initSidebar: () => void;
    setTheme: (theme: string) => void;
    getTheme: () => string;
  }
}

//index.html
//hero ===========================================================
declare const CF_THEME_GROUPS: { title: string; themes: [string, string][] }[];

function initHeroThemes(): void {
  const stage = document.querySelector<HTMLElement>(".hero-demo");
  if (!stage || typeof CF_THEME_GROUPS === "undefined") return;

  const themes = CF_THEME_GROUPS.flatMap((group) => group.themes);
  if (!themes.length) return;

  const themeName = document.querySelector<HTMLElement>("[data-theme-name]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = Math.max(0, themes.findIndex(([value]) => value === window.getTheme()));
  let paused = false;
  let visible = true;

  const show = (): void => {
    const current = themes[index];
    if (!current) return;

    const [value, label] = current;
    stage.setAttribute("data-theme", value);
    if (themeName) themeName.textContent = label;
  };

  show();

  if (!reduce) {
    setInterval(() => {
      if (paused || !visible) return;
      index = (index + 1) % themes.length;
      show();
    }, 3000);

    stage.addEventListener("pointerenter", () => (paused = true));
    stage.addEventListener("pointerleave", () => (paused = false));

    new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    }).observe(stage);
  }

  document.addEventListener("themechange", (event) => {
    const { theme } = (event as CustomEvent<{ theme: string }>).detail;
    const next = themes.findIndex(([value]) => value === theme);
    if (next < 0) return;

    index = next;
    show();
  });
}


//initSidebar =============================================
declare global {
  interface Window {
    initThemeSelector: () => void;
    initSelect: () => void;
    initSidebar: () => void;
    setTheme: (theme: string) => void;
  }
}

export async function initSidebar(): Promise<void> {
  const sidebar = document.querySelector<HTMLElement>(".doc-sidebar");
  if (!sidebar) return;

  try {
    const response = await fetch("../../components/sidebar.html");
    if (!response.ok) throw new Error("Unable to load sidebar.");

    sidebar.innerHTML = await response.text();

    document.dispatchEvent(new CustomEvent("sidebar:loaded"));
  } catch (err) {
    console.error(err);
    sidebar.innerHTML = `<p class="text-size-sm">Failed to load navigation.</p>`;
  }
}

document.addEventListener("sidebar:loaded", () => {
  window.initThemeSelector();
  window.initSelect();
  window.initSidebar();
});

//theme.html
//theme gallery ===================================
function initThemeGallery(): void {
  document.querySelectorAll<HTMLElement>(".theme-card[data-theme-set]").forEach((card) => {
    card.addEventListener("click", () => {
      const theme = card.dataset.themeSet;
      if (!theme) return;

      window.setTheme(theme);
    });
  });
}


//animations.html 
const replayButtons = document.querySelectorAll<HTMLButtonElement>("[data-entrance-replay]");

replayButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const demo = button.closest<HTMLElement>("[data-entrance]");

    if (!demo) return;

    const effect = demo.dataset.entrance;
    const target = demo.querySelector<HTMLElement>("[class*='fade-in'], [class*='slide-'], [class*='zoom-'], [class*='pop-'], [class*='blur-']");

    if (!effect || !target) return;

    target.classList.remove(effect);
    void target.offsetWidth;
    target.classList.add(effect);
  });
});