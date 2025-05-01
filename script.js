document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('petModal');
    const closeBtn = document.querySelector('.close-modal');
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
  
    function openModal(petId) {
      const pet = petData[petId];
      if (!pet) return;
  
      document.getElementById('modalPetImage').src = pet.image;
      document.getElementById('modalPetImage').alt = `${pet.name} the ${pet.breed}`;
      document.getElementById('modalPetName').textContent = pet.name;
      document.getElementById('modalPetBreed').textContent = pet.breed;
      document.getElementById('modalPetAge').textContent = pet.age;
      document.getElementById('modalPetStatus').textContent = pet.status;
      document.getElementById('modalPetStatus').className = `status ${pet.status.toLowerCase()}`;
      document.getElementById('modalPetDescription').textContent = pet.description;
  
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  
    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  
    viewDetailsBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const petCard = btn.closest('.adoption-card');
        const petId = petCard.dataset.petId;
        openModal(petId);
      });
    });
  
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
  
    // -------------------- Treatment Form --------------------
    const treatmentForm = document.getElementById('treatmentForm');
    if (treatmentForm) {
      treatmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
  
        const formData = new FormData(treatmentForm);
        const newTreatment = {
          petName: formData.get('petName'),
          treatmentType: formData.get('treatmentType'),
          date: formData.get('treatmentDate'),
          notes: formData.get('notes')
        };
  
        addTreatment(newTreatment);
        treatmentForm.reset();
      });
  
      renderTreatmentsTable();
    }
  
    // -------------------- Filters --------------------
    const filterPet = document.getElementById('filterPet');
    const filterType = document.getElementById('filterType');
    const sortBy = document.getElementById('sortBy');
    const resetFilters = document.getElementById('resetFilters');
  
    if (filterPet) filterPet.addEventListener('change', renderTreatmentsTable);
    if (filterType) filterType.addEventListener('change', renderTreatmentsTable);
    if (sortBy) sortBy.addEventListener('change', renderTreatmentsTable);
    if (resetFilters) {
      resetFilters.addEventListener('click', () => {
        filterPet.value = '';
        filterType.value = '';
        sortBy.value = 'date-desc';
        renderTreatmentsTable();
      });
    }
  
    // -------------------- Navigation Highlight --------------------
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === currentPath);
    });
  
    // -------------------- Adoption Modal Form --------------------
    const openAdoptionModalBtn = document.getElementById('openAdoptionModal');
    const adoptionModal = document.getElementById('adoptionModal');
    const closeAdoptionModalBtn = document.getElementById('closeModal');
    const adoptionForm = document.getElementById('adoptionForm');
    const submissionMessage = document.getElementById('submissionMessage');
  
    if (openAdoptionModalBtn && adoptionModal) {
      openAdoptionModalBtn.addEventListener('click', () => {
        adoptionModal.classList.remove('hidden');
        adoptionModal.style.display = 'flex';
      });
  
      closeAdoptionModalBtn?.addEventListener('click', () => {
        adoptionModal.style.display = 'none';
        adoptionModal.classList.add('hidden');
      });
  
      window.addEventListener('click', (e) => {
        if (e.target === adoptionModal) {
          adoptionModal.style.display = 'none';
          adoptionModal.classList.add('hidden');
        }
      });
    }
  
    if (adoptionForm) {
      adoptionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const adopter_name = document.getElementById('adopterName').value.trim();
        const adopter_contact = document.getElementById('adopterPhone').value.trim();
        const petName = document.getElementById('preferredPet').value.trim();
        let pet_id = null;
  
        for (const id in petData) {
          if (petData[id].name.toLowerCase() === petName.toLowerCase()) {
            pet_id = id;
            break;
          }
        }
  
        const payload = {
          pet_id,
          adopter_name,
          adopter_contact
        };
  
        try {
          const response = await fetch('http://127.0.0.1:5000/adoptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
  
          const result = await response.json();
  
          if (response.ok) {
            console.log('✅ Adoption submitted:', result);
            adoptionModal.style.display = 'none';
            adoptionModal.classList.add('hidden');
            adoptionForm.reset();
            submissionMessage?.classList.remove('hidden');
            submissionMessage?.classList.add('show');
            setTimeout(() => {
              submissionMessage?.classList.remove('show');
              submissionMessage?.classList.add('hidden');
            }, 3000);
          } else {
            alert('Submission failed: ' + result.message);
          }
        } catch (error) {
          console.error('Error submitting form:', error);
          alert('Failed to connect to server.');
        }
      });
    }
  
    renderTreatmentsTable();
  });
  
  // -------------------- Static Pet Data --------------------
  const petData = {
    1: { name: "Buddy", breed: "Golden Retriever", age: "2 years old", status: "Available", image: "images/dog1.jpeg", description: "Friendly and energetic, great with kids." },
    2: { name: "Luna", breed: "Siamese Cat", age: "1 year old", status: "Pending", image: "images/pet2.jpg", description: "Graceful and affectionate Siamese with blue eyes." },
    3: { name: "Max", breed: "German Shepherd", age: "3 years old", status: "Available", image: "images/pet3.jpg", description: "Loyal, intelligent, and protective." },
    4: { name: "Bella", breed: "Persian Cat", age: "2 years old", status: "Adopted", image: "images/pet4.jpg", description: "Calm and pampered Persian cat." },
    5: { name: "Charlie", breed: "Beagle", age: "1 year old", status: "Available", image: "images/pet5.jpg", description: "Social and curious Beagle puppy." },
    6: { name: "Daisy", breed: "Maine Coon", age: "2 years old", status: "Available", image: "images/pet6.jpg", description: "Intelligent, playful, family-friendly." },
    7: { name: "Bobo", breed: "Street", age: "1 year old", status: "Pending", image: "images/cat4.jpeg", description: "Smart and playful, great with children." },
    8: { name: "Bruno", breed: "Street", age: "1 year old", status: "Adopted✅", image: "images/dog4.jpeg", description: "Energetic and loving stray." },
    9: { name: "Daisy", breed: "Maine Coon", age: "2 years old", status: "Available", image: "images/dog5.jpeg", description: "Same name, same awesome." },
    10: { name: "Maxo", breed: "Street", age: "1 year old", status: "Available", image: "images/dog6.jpeg", description: "Chill but alert streetwise dog." }
  };
  
  // -------------------- Treatment Logic --------------------
  let treatments = [
    { id: 1, petName: "Buddy", treatmentType: "Vaccination", date: "2024-03-15", notes: "Annual rabies vaccination" },
    { id: 2, petName: "Luna", treatmentType: "Check-up", date: "2024-03-10", notes: "Healthy" },
    { id: 3, petName: "Max", treatmentType: "Surgery", date: "2024-03-05", notes: "Neutered successfully" }
  ];
  
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  function getFilteredAndSortedTreatments() {
    const filterPet = document.getElementById('filterPet')?.value || '';
    const filterType = document.getElementById('filterType')?.value || '';
    const sortBy = document.getElementById('sortBy')?.value || 'date-desc';
  
    let filtered = treatments.filter(t =>
      (!filterPet || t.petName === filterPet) &&
      (!filterType || t.treatmentType === filterType)
    );
  
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.date) - new Date(a.date);
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'pet-asc': return a.petName.localeCompare(b.petName);
        case 'type-asc': return a.treatmentType.localeCompare(b.treatmentType);
        default: return 0;
      }
    });
  }
  
  function renderTreatmentsTable() {
    const tableBody = document.getElementById('treatmentsTableBody');
    if (!tableBody) return;
  
    const rows = getFilteredAndSortedTreatments().map(t => `
      <tr>
        <td>${t.petName}</td>
        <td>${t.treatmentType}</td>
        <td>${formatDate(t.date)}</td>
        <td>${t.notes || '-'}</td>
        <td>
          <button class="action-btn view-btn" onclick="viewTreatment(${t.id})">View</button>
          <button class="action-btn edit-btn" onclick="editTreatment(${t.id})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteTreatment(${t.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  
    tableBody.innerHTML = rows;
  }
  
  function addTreatment(treatment) {
    treatment.id = treatments.length + 1;
    treatments.unshift(treatment);
    renderTreatmentsTable();
  }
  
  function viewTreatment(id) {
    const t = treatments.find(t => t.id === id);
    if (t) alert(`Pet: ${t.petName}\nType: ${t.treatmentType}\nDate: ${formatDate(t.date)}\nNotes: ${t.notes}`);
  }
  
  function editTreatment(id) {
    const t = treatments.find(t => t.id === id);
    if (t) alert(`Edit treatment for ${t.petName}`);
  }
  
  function deleteTreatment(id) {
    if (confirm('Are you sure you want to delete this treatment?')) {
      treatments = treatments.filter(t => t.id !== id);
      renderTreatmentsTable();
    }
  }
  