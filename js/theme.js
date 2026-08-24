// Applies the resolved theme before first paint to avoid a flash of the wrong theme.
// Loaded in <head> without `defer` on purpose.
(function () {
  var stored = null;
  try {
    stored = localStorage.getItem('theme');
  } catch (e) {
    // localStorage unavailable (private browsing, blocked storage) — fall back to the OS setting.
  }
  var theme = (stored === 'dark' || stored === 'light')
    ? stored
    : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();
