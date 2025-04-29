document.addEventListener('DOMContentLoaded', () => {
    // Navigation active link
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // CTA Button Click
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            console.log('Manage Pets button clicked');
        });
    }

    // Modal Control
    const openModalBtn = document.getElementById('openAdoptionModal');
    const modal = document.getElementById('adoptionModal');
    const closeModalBtn = document.getElementById('closeModal');

    if (openModalBtn && modal && closeModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });

        closeModalBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
});
