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

    // Adoption Form Submission
    const adoptionForm = document.getElementById('adoptionForm');
    const submissionMessage = document.getElementById('submissionMessage');

    if (adoptionForm) {
        adoptionForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const data = {
                adopter_name: document.getElementById('adopterName').value,
                adopter_contact: document.getElementById('adopterPhone').value,  // Use phone as contact
                pet_id: null  // Or set based on selected pet
            };

            try {
                const res = await fetch('http://localhost:3000/api/adoption_form', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await res.json();

                if (res.ok) {
                    modal.classList.add('hidden');
                    adoptionForm.reset();
                    submissionMessage.classList.remove('hidden');
                    setTimeout(() => submissionMessage.classList.add('hidden'), 4000);
                } else {
                    alert(`Error: ${result.message}`);
                }
            } catch (err) {
                console.error('Submission error:', err);
                alert('An error occurred. Please try again later.');
            }
        });
    }
});
