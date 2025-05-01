document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adoptionForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const adopter_name = document.getElementById('adopterName').value.trim();
    const adopter_contact = document.getElementById('adopterPhone').value.trim();
    const preferredPet = document.getElementById('preferredPet').value.trim();

    // Map preferred pet name to pet_id (optional)
    let pet_id = null;
    if (preferredPet) {
      try {
        const res = await fetch('http://localhost:5000/pets');
        const pets = await res.json();
        const pet = pets.find(p => p.name.toLowerCase() === preferredPet.toLowerCase());
        if (pet) pet_id = pet.id;
      } catch (err) {
        console.error('Error fetching pets:', err);
      }
    }

    const payload = {
      adopter_name,
      adopter_contact,
      pet_id
    };

    try {
      const response = await fetch('http://localhost:5000/adoptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (response.ok) {
        alert('🎉 Application submitted!');
        form.reset();
      } else {
        alert(`❌ Submission failed: ${result.message}`);
      }
    } catch (error) {
      console.error('🚫 Error submitting form:', error);
      alert('Server connection error.');
    }
  });
});
