/* theme toggle — persists to localStorage; absent = follow system */
(function () {
  const KEY = "bwd-theme";
  const root = document.documentElement;
  const saved = localStorage.getItem(KEY);
  if (saved) root.dataset.theme = saved;

  const sun = '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.2" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  const moon = '<svg viewBox="0 0 16 16" fill="none"><path d="M13.8 9.6A6 6 0 0 1 6.4 2.2a6 6 0 1 0 7.4 7.4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';

  function icon() {
    const dark = root.dataset.theme === "dark" ||
      (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    document.querySelectorAll("#theme-toggle").forEach(b => b.innerHTML = dark ? sun : moon);
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("#theme-toggle");
    if (!b) return;
    const dark = root.dataset.theme === "dark" ||
      (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = dark ? "light" : "dark";
    localStorage.setItem(KEY, root.dataset.theme);
    icon();
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", icon);
  document.addEventListener("DOMContentLoaded", icon);
  icon();
})();
