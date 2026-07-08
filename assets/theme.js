// Shared theme toggle for DatLearn lessons & references.
// Expects a <button class="theme-toggle" id="themeToggle"><span id="themeLabel"></span></button>.
// Persists the choice in localStorage; otherwise follows the OS preference.
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const label = document.getElementById('themeLabel');
  if (!btn) return;
  const saved = localStorage.getItem('datlearn-theme');
  if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);

  function current() {
    const t = root.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function render() { if (label) label.textContent = current() === 'dark' ? 'Light' : 'Dark'; }
  btn.addEventListener('click', function () {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('datlearn-theme', next);
    render();
  });
  render();
})();
