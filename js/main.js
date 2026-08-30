document.addEventListener('DOMContentLoaded', () => {

  /* ===== Yıl ===== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== Mobil menü ===== */
  const toggleBtn = document.querySelector('[data-nav-toggle]');
  const closeBtn = document.querySelector('[data-nav-close]');
  const panel = document.querySelector('[data-mobile-nav]');

  if (toggleBtn && panel) {
    const openNav = () => { panel.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const closeNav = () => { panel.classList.remove('open'); document.body.style.overflow = ''; };

    toggleBtn.addEventListener('click', openNav);
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    panel.addEventListener('click', (e) => { if (e.target === panel) closeNav(); });
    panel.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
  }

  /* ===== Geri dön butonu ===== */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 500);
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ===== İletişim formu ===== */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (contactForm && formNote) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.name.value.trim();
      const phone = contactForm.phone.value.trim();
      if (!name || !phone) {
        formNote.textContent = 'Lütfen zorunlu alanları doldurun.';
        formNote.classList.remove('success');
        return;
      }
      formNote.textContent = `Teşekkürler ${name}, en kısa sürede dönüş yapacağız.`;
      formNote.classList.add('success');
      contactForm.reset();
    });
  }
});
