const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const navCta = document.getElementById('navCta');
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navCta.classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  navCta.classList.remove('open');
}));
