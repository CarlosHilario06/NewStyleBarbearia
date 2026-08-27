import { initHeroScene } from './three-scene.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

/* ---------- GSAP scroll reveals ----------
   The ".gsap-ready" class is what switches [data-reveal] elements to
   start at opacity: 0 (see style.css) — only added here, so a failed or
   slow GSAP load never leaves content stuck invisible. */
if (window.gsap) {
  document.documentElement.classList.add('gsap-ready');
  gsap.registerPlugin(ScrollTrigger);

  const heroReveals = gsap.utils.toArray('.hero [data-reveal]');
  gsap.set(heroReveals, { y: reduceMotion ? 0 : 26 });
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl.to(heroReveals, {
    opacity: 1,
    y: 0,
    duration: reduceMotion ? 0.01 : 0.9,
    stagger: reduceMotion ? 0 : 0.12,
  });

  gsap.utils.toArray('[data-reveal]:not(.hero [data-reveal])').forEach((el, i) => {
    gsap.set(el, { y: reduceMotion ? 0 : 24 });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: reduceMotion ? 0.01 : 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/* ---------- 3D hero scene ---------- */
const sceneContainer = document.getElementById('heroScene');
const scene = initHeroScene(sceneContainer);

if (scene && window.gsap && !reduceMotion) {
  const scales = scene.furniture.map((piece) => piece.scale);
  gsap.from(scales, {
    x: 0.001, y: 0.001, z: 0.001,
    duration: 1.1,
    ease: 'back.out(1.6)',
    stagger: 0.06,
    delay: 0.2,
  });
}

if (!scene) {
  sceneContainer?.classList.add('is-static');
}
