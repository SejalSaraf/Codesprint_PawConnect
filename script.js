document.addEventListener('DOMContentLoaded', () => {
    // Modal functionality
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

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Treatment form functionality
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

        renderTreatmentsTable(); // Only render if treatmentForm exists
    }
});

// Pet data (in a real application, this would come from a database)
const petData = {
    1: {
        name: "Buddy",
        breed: "Golden Retriever",
        age: "2 years old",
        status: "Available",
        image: "images\dog1.jpeg",
        description: "Buddy is a friendly and energetic Golden Retriever who loves playing fetch and going for long walks. He's great with children and other dogs, and has completed basic obedience training."
    },
    2: {
        name: "Luna",
        breed: "Siamese Cat",
        age: "1 year old",
        status: "Pending",
        image: "images/pet2.jpg",
        description: "Luna is a graceful Siamese cat with striking blue eyes. She's very affectionate and enjoys cuddling, but also has an independent streak. She's litter-trained and gets along well with other cats."
    },
    3: {
        name: "Max",
        breed: "German Shepherd",
        age: "3 years old",
        status: "Available",
        image: "images/pet3.jpg",
        description: "Max is a loyal and intelligent German Shepherd. He's well-trained and would make an excellent companion for an active family. He's protective but friendly when properly introduced to new people."
    },
    4: {
        name: "Bella",
        breed: "Persian Cat",
        age: "2 years old",
        status: "Adopted",
        image: "images/pet4.jpg",
        description: "Bella is a beautiful Persian cat with a calm and gentle personality. She enjoys being pampered and is very low-maintenance. She's perfect for someone looking for a quiet companion."
    },
    5: {
        name: "Charlie",
        breed: "Beagle",
        age: "1 year old",
        status: "Available",
        image: "images/pet5.jpg",
        description: "Charlie is an adorable Beagle puppy full of energy and curiosity. He's very social and loves meeting new people. He's currently in training and would do best in an active household."
    },
    6: {
        name: "Daisy",
        breed: "Maine Coon",
        age: "2 years old",
        status: "Available",
        image: "images/pet6.jpg",
        description: "Daisy is a majestic Maine Coon with a luxurious coat. She's very intelligent and enjoys interactive play. She's great with children and would make a wonderful family pet."
    },

    7: {
        name: "Bobo",
        breed: "Street",
        age: "1 year old",
        status: "Pending",
        image: "images\cat4.jpeg",
        description: "Bobo is a majestic Maine Coon with a luxurious coat. She's very intelligent and enjoys interactive play. She's great with children and would make a wonderful family pet."
    },

    8: {
        name: "Bruno",
        breed: "Street",
        age: "1 year old",
        status: "Adopted✅",
        image: "images\dog4.jpeg",
        description: "Bruno is a majestic Maine Coon with a luxurious coat. She's very intelligent and enjoys interactive play. She's great with children and would make a wonderful family pet."
    },

    9: {
        name: "Daisy",
        breed: "Maine Coon",
        age: "2 years old",
        status: "Available",
        image: "images\dog5.jpeg",
        description: "Daisy is a majestic Maine Coon with a luxurious coat. She's very intelligent and enjoys interactive play. She's great with children and would make a wonderful family pet."
    },

    10: {
        name: "Maxo",
        breed: "Street",
        age: "1 year old",
        status: "Available",
        image: "images\dog6.jpeg",
        description: "Maxo is a majestic Maine Coon with a luxurious coat. She's very intelligent and enjoys interactive play. She's great with children and would make a wonderful family pet."
    }
};

// Modal functionality
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('petModal');
    const closeBtn = document.querySelector('.close-modal');
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');

    // Function to open modal with pet data
    function openModal(petId) {
        const pet = petData[petId];
        if (!pet) return;

        // Update modal content
        document.getElementById('modalPetImage').src = pet.image;
        document.getElementById('modalPetImage').alt = `${pet.name} the ${pet.breed}`;
        document.getElementById('modalPetName').textContent = pet.name;
        document.getElementById('modalPetBreed').textContent = pet.breed;
        document.getElementById('modalPetAge').textContent = pet.age;
        document.getElementById('modalPetStatus').textContent = pet.status;
        document.getElementById('modalPetStatus').className = `status ${pet.status.toLowerCase()}`;
        document.getElementById('modalPetDescription').textContent = pet.description;

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Function to close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore background scrolling
    }

    // Event listeners
    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const petCard = btn.closest('.adoption-card');
            const petId = petCard.dataset.petId;
            openModal(petId);
        });
    });

    closeBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});

// Treatment data (in a real application, this would come from a database)
let treatments = [
    {
        id: 1,
        petName: "Buddy",
        treatmentType: "Vaccination",
        date: "2024-03-15",
        notes: "Annual rabies vaccination"
    },
    {
        id: 2,
        petName: "Luna",
        treatmentType: "Check-up",
        date: "2024-03-10",
        notes: "Regular health check, all good"
    },
    {
        id: 3,
        petName: "Max",
        treatmentType: "Surgery",
        date: "2024-03-05",
        notes: "Neutering procedure completed successfully"
    }
];

// Function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to filter and sort treatments
function getFilteredAndSortedTreatments() {
    const filterPet = document.getElementById('filterPet').value;
    const filterType = document.getElementById('filterType').value;
    const sortBy = document.getElementById('sortBy').value;

    let filteredTreatments = treatments.filter(treatment => {
        const petMatch = !filterPet || treatment.petName === filterPet;
        const typeMatch = !filterType || treatment.treatmentType === filterType;
        return petMatch && typeMatch;
    });

    // Sort treatments
    filteredTreatments.sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'pet-asc':
                return a.petName.localeCompare(b.petName);
            case 'type-asc':
                return a.treatmentType.localeCompare(b.treatmentType);
            default:
                return 0;
        }
    });

    return filteredTreatments;
}

// Function to render treatments table
function renderTreatmentsTable() {
    const tableBody = document.getElementById('treatmentsTableBody');
    if (!tableBody) return;

    const filteredTreatments = getFilteredAndSortedTreatments();

    tableBody.innerHTML = filteredTreatments.map(treatment => `
        <tr>
            <td>${treatment.petName}</td>
            <td>${treatment.treatmentType}</td>
            <td>${formatDate(treatment.date)}</td>
            <td>${treatment.notes || '-'}</td>
            <td>
                <button class="action-btn view-btn" onclick="viewTreatment(${treatment.id})">View</button>
                <button class="action-btn edit-btn" onclick="editTreatment(${treatment.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteTreatment(${treatment.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Function to add new treatment
function addTreatment(treatment) {
    treatment.id = treatments.length + 1;
    treatments.unshift(treatment);
    renderTreatmentsTable();
}

// Function to view treatment details
function viewTreatment(id) {
    const treatment = treatments.find(t => t.id === id);
    if (!treatment) return;

    // In a real application, this would open a modal or navigate to a detail page
    alert(`Treatment Details:\nPet: ${treatment.petName}\nType: ${treatment.treatmentType}\nDate: ${formatDate(treatment.date)}\nNotes: ${treatment.notes || 'None'}`);
}

// Function to edit treatment
function editTreatment(id) {
    const treatment = treatments.find(t => t.id === id);
    if (!treatment) return;

    // In a real application, this would open an edit form
    alert(`Edit treatment for ${treatment.petName}`);
}

// Function to delete treatment
function deleteTreatment(id) {
    if (confirm('Are you sure you want to delete this treatment record?')) {
        treatments = treatments.filter(t => t.id !== id);
        renderTreatmentsTable();
    }
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    const treatmentForm = document.getElementById('treatmentForm');
    const filterPet = document.getElementById('filterPet');
    const filterType = document.getElementById('filterType');
    const sortBy = document.getElementById('sortBy');
    const resetFilters = document.getElementById('resetFilters');
    
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
    }

    // Add event listeners for filters
    if (filterPet) {
        filterPet.addEventListener('change', renderTreatmentsTable);
    }
    if (filterType) {
        filterType.addEventListener('change', renderTreatmentsTable);
    }
    if (sortBy) {
        sortBy.addEventListener('change', renderTreatmentsTable);
    }
    if (resetFilters) {
        resetFilters.addEventListener('click', () => {
            filterPet.value = '';
            filterType.value = '';
            sortBy.value = 'date-desc';
            renderTreatmentsTable();
        });
    }

    // Initial render of treatments table
    renderTreatmentsTable();
});

// Keep existing modal functionality below