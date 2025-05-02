console.log("🚀 adoption_form.js is running");

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adoptionForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const adopter_name = document.getElementById('adopterName').value.trim();
    const adopter_email = document.getElementById('adopterEmail').value.trim();
    const adopter_phone = document.getElementById('adopterPhone').value.trim();
    const adopter_address = document.getElementById('adopterAddress').value.trim();
    const preferred_pet_name = document.getElementById('preferredPet').value.trim();

    const payload = {
      adopter_name,
      adopter_email,
      adopter_phone,
      adopter_address,
      preferred_pet_name
    };

    console.log("Submitting adoption form...");
    console.log("Payload:", payload);

    try {
      const res = await fetch('http://localhost:3000/api/adoption-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      console.log("Server response:", result);

      if (res.ok) {
        alert('Application submitted successfully!');
        form.reset();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Failed to submit form.');
    }
  });
});
