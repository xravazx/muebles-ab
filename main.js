// Intersection Observer for scroll animations (fade in effect)

const setupIntersectionObserver = () => {
  const elementsToAnimate = document.querySelectorAll('.fade-in');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Trigger when 15% of the element is visible
  };

  const observer = new IntersectionObserver((entries, observerStyle) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observerStyle.unobserve(entry.target); // Stop observing once it's visible
      }
    });
  }, observerOptions);

  elementsToAnimate.forEach(element => {
    observer.observe(element);
  });
};

// Initialize after DOM load
document.addEventListener('DOMContentLoaded', () => {
  setupIntersectionObserver();
  setupProductModal();
});

// Product Modal Logic
const setupProductModal = () => {
  const modal = document.getElementById('product-modal');
  const closeBtn = document.querySelector('.close-modal');
  const detailButtons = document.querySelectorAll('.product-card .btn-secondary');

  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalWaLink = document.getElementById('modal-wa-link');

  const baseWaUrl = "https://wa.me/1234567890?text=";

  detailButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = e.target.closest('.product-card');
      const title = card.querySelector('h3').innerText;
      const desc = card.querySelector('.product-info p').innerText;
      const imgSrc = card.querySelector('img').src;

      modalTitle.innerText = title;
      modalDesc.innerText = desc;
      modalImg.src = imgSrc;

      // Update WhatsApp link text
      const message = `Hola GKorp, me interesa cotizar el modelo: ${title}.`;
      modalWaLink.href = baseWaUrl + encodeURIComponent(message);

      modal.classList.add('show');
    });
  });

  // Close modal logic
  const closeModal = () => {
    modal.classList.remove('show');
  };

  closeBtn.addEventListener('click', closeModal);

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
};
