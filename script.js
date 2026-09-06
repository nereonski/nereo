/* Shared enhancements. Content and navigation work without JavaScript. */
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  let theme = 'light';
  try { theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'; } catch { /* Storage is optional. */ }
  function applyTheme() {
    root.dataset.theme = theme;
    toggle?.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle?.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#22231f' : '#eeece5');
  }
  applyTheme();
  toggle?.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    applyTheme();
    try { localStorage.setItem('theme', theme); } catch { /* Continue without persistence. */ }
  });
  const clock = document.querySelector('#local-time');
  if (clock) {
    const updateTime = () => {
      const now = new Date();
      clock.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
      clock.dateTime = now.toISOString();
    };
    updateTime();
    setInterval(() => { if (!document.hidden) updateTime(); }, 30000);
  }
  const lines = document.querySelector('#orbit-lines');
  const slider = document.querySelector('#orbit-shape');
  if (!lines || !slider) return;
  const ns = 'http://www.w3.org/2000/svg';
  const rings = Array.from({ length: 32 }, (_, i) => {
    const ellipse = document.createElementNS(ns, 'ellipse');
    ellipse.setAttribute('rx', '290');
    ellipse.setAttribute('transform', `rotate(${i * 5.625})`);
    return ellipse;
  });
  lines.replaceChildren(...rings);
  const draw = () => rings.forEach((ring, i) => ring.setAttribute('ry', String(Number(slider.value) + Math.sin(i / 32 * Math.PI) * 35)));
  slider.addEventListener('input', draw);
  draw();
  // A finite introduction, never an endless decorative rendering loop.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lines.animate([{ opacity: .25, transform: 'translate(500px, 200px) rotate(-12deg)' }, { opacity: 1, transform: 'translate(500px, 200px) rotate(0deg)' }], { duration: 1600, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }
})();
