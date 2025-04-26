document.getElementById('adoptionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        name: document.getElementById('adopterName').value,
        email: document.getElementById('adopterEmail').value,
        phone: document.getElementById('adopterPhone').value,
        address: document.getElementById('adopterAddress').value,
        preferredPet: document.getElementById('preferredPet').value
    };

    console.log('Form submitted:', formData);
    // TODO: send to server via fetch()
});
