const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  navigation.classList.toggle('is-open', !open);
});

navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  navigation.classList.remove('is-open');
}));

const filmDialog = document.querySelector('.film-dialog');
const filmVideo = filmDialog.querySelector('video');
document.querySelector('[data-open-film]').addEventListener('click', () => {
  filmDialog.showModal();
  filmVideo.currentTime = 0;
  filmVideo.play().catch(() => {});
});
document.querySelector('[data-close-film]').addEventListener('click', () => filmDialog.close());
filmDialog.addEventListener('click', event => {
  if (event.target === filmDialog) filmDialog.close();
});
filmDialog.addEventListener('close', () => filmVideo.pause());

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -35px 0px' });
  document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
} else {
  document.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
}
