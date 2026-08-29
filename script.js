/* ---------- mobile nav ---------- */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const navCta = document.getElementById('navCta');

menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navCta.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  navCta.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

/* ---------- header scroll state ---------- */
const header = document.getElementById('siteHeader');
function onHeaderScroll() {
  header.classList.toggle('is-scrolled', window.scrollY > 12);
}
window.addEventListener('scroll', onHeaderScroll, { passive: true });
onHeaderScroll();

/* ---------- scroll reveals (no external library) ----------
   ".js-reveal" is what switches [data-reveal] elements to their hidden
   start state (see style.css) — only added once IntersectionObserver is
   confirmed available, so content is never stuck invisible without it. */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window && !reduceMotion) {
  document.documentElement.classList.add('js-reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
}
