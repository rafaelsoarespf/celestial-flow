document.addEventListener("DOMContentLoaded", init);

function init(): void {
  initSidebar();
  initThemeGallery();
}



//initSidebar =============================================
declare global {
  interface Window {
    initThemeSelector: () => void;
    initSelect: () => void;
    initSidebar: () => void;
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

      document.body.setAttribute("data-theme", theme);
    });
  });
}