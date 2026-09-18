document.addEventListener("DOMContentLoaded", init);
function init() {
    initSidebar();
    initThemeGallery();
}
export async function initSidebar() {
    const sidebar = document.querySelector(".doc-sidebar");
    if (!sidebar)
        return;
    try {
        const response = await fetch("../../components/sidebar.html");
        if (!response.ok)
            throw new Error("Unable to load sidebar.");
        sidebar.innerHTML = await response.text();
        document.dispatchEvent(new CustomEvent("sidebar:loaded"));
    }
    catch (err) {
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
function initThemeGallery() {
    document.querySelectorAll(".theme-card[data-theme-set]").forEach((card) => {
        card.addEventListener("click", () => {
            const theme = card.dataset.themeSet;
            if (!theme)
                return;
            document.body.setAttribute("data-theme", theme);
        });
    });
}
//animations.html
// 
const replayButtons = document.querySelectorAll("[data-entrance-replay]");
replayButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const demo = button.closest("[data-entrance]");
        if (!demo)
            return;
        const effect = demo.dataset.entrance;
        const target = demo.querySelector("[class*='fade-in'], [class*='slide-'], [class*='zoom-'], [class*='pop-'], [class*='blur-']");
        if (!effect || !target)
            return;
        target.classList.remove(effect);
        void target.offsetWidth;
        target.classList.add(effect);
    });
});
//# sourceMappingURL=main.js.map