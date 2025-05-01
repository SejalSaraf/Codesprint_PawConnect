// DOM Elements
const tabLinks = document.querySelectorAll('nav a');
const tabContents = document.querySelectorAll('.tab-content');
const addEventBtn = document.getElementById('addEventBtn');
const addVaccinationBtn = document.getElementById('addVaccinationBtn');
const sendNotificationBtn = document.getElementById('sendNotificationBtn');
const eventModal = document.getElementById('eventModal');
const vaccinationModal = document.getElementById('vaccinationModal');
const notificationModal = document.getElementById('notificationModal');
const closeButtons = document.querySelectorAll('.close');
const eventForm = document.getElementById('eventForm');
const vaccinationForm = document.getElementById('vaccinationForm');
const notificationForm = document.getElementById('notificationForm');

// Sample Data
const sampleEvents = [
    {
        title: "Adoption Drive",
        date: "2024-03-15",
        time: "10:00",
        location: "Central Park",
        description: "Join us for our monthly adoption drive! Meet our lovely pets and find your perfect companion.",
        status: "upcoming"
    },
    {
        title: "Vaccination Clinic",
        date: "2024-03-20",
        time: "14:00",
        location: "Shelter Medical Center",
        description: "Free vaccination clinic for all adopted pets. Bring your pet's medical records.",
        status: "upcoming"
    },
    {
        title: "Volunteer Training",
        date: "2024-03-10",
        time: "09:00",
        location: "Shelter Training Room",
        description: "New volunteer orientation and training session. Learn about pet care and shelter operations.",
        status: "completed"
    }
];

const sampleVaccinations = [
    {
        petName: "Max",
        vaccineType: "rabies",
        vaccinationDate: "2024-02-15",
        nextDueDate: "2025-02-15",
        status: "upcoming"
    },
    {
        petName: "Luna",
        vaccineType: "dhpp",
        vaccinationDate: "2024-01-20",
        nextDueDate: "2024-07-20",
        status: "upcoming"
    },
    {
        petName: "Rocky",
        vaccineType: "bordetella",
        vaccinationDate: "2024-02-01",
        nextDueDate: "2024-08-01",
        status: "completed"
    }
];

const sampleNotifications = [
    {
        type: "event",
        title: "Upcoming Adoption Drive",
        message: "Don't forget about our adoption drive this weekend! We have many pets looking for their forever homes.",
        recipients: ["staff", "volunteers"],
        sentAt: "2024-03-01T10:00:00",
        status: "unread"
    },
    {
        type: "vaccination",
        title: "Vaccination Reminder",
        message: "Max's rabies vaccination is due next week. Please schedule an appointment.",
        recipients: ["staff"],
        sentAt: "2024-03-05T09:00:00",
        status: "read"
    },
    {
        type: "general",
        title: "New Volunteer Orientation",
        message: "Welcome to our new volunteers! Please attend the training session this Saturday.",
        recipients: ["volunteers"],
        sentAt: "2024-03-08T14:00:00",
        status: "unread"
    }
];

// Initialize FullCalendar
document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: sampleEvents.map(event => ({
            title: event.title,
            start: `${event.date}T${event.time}`,
            backgroundColor: event.status === 'completed' ? '#2ecc71' : '#3498db',
            borderColor: event.status === 'completed' ? '#27ae60' : '#2980b9'
        })),
        eventClick: function(info) {
            showEventDetails(info.event);
        }
    });
    calendar.render();
});

// Tab Switching
tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = link.getAttribute('data-tab');
        
        // Update active tab
        tabLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show corresponding content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    });
});

// Modal Handling
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

// Event Listeners for Modals
addEventBtn.addEventListener('click', () => openModal(eventModal));
addVaccinationBtn.addEventListener('click', () => openModal(vaccinationModal));
sendNotificationBtn.addEventListener('click', () => openModal(notificationModal));

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        closeModal(modal);
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Form Submissions
eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventData = {
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        status: 'upcoming'
    };

    try {
        // API call to save event
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
            closeModal(eventModal);
            eventForm.reset();
            // Refresh calendar and events list
            loadEvents();
        } else {
            alert('Error saving event');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving event');
    }
});

vaccinationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const vaccinationData = {
        petName: document.getElementById('petName').value,
        vaccineType: document.getElementById('vaccineType').value,
        vaccinationDate: document.getElementById('vaccinationDate').value,
        nextDueDate: document.getElementById('nextDueDate').value,
        status: 'upcoming'
    };

    try {
        // API call to save vaccination schedule
        const response = await fetch('/api/vaccinations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vaccinationData)
        });

        if (response.ok) {
            closeModal(vaccinationModal);
            vaccinationForm.reset();
            // Refresh vaccination list
            loadVaccinations();
        } else {
            alert('Error saving vaccination schedule');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving vaccination schedule');
    }
});

notificationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const notificationData = {
        type: document.getElementById('notificationType').value,
        title: document.getElementById('notificationTitle').value,
        message: document.getElementById('notificationMessage').value,
        recipients: Array.from(document.getElementById('notificationRecipients').selectedOptions).map(option => option.value),
        status: 'unread'
    };

    try {
        // API call to send notification
        const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(notificationData)
        });

        if (response.ok) {
            closeModal(notificationModal);
            notificationForm.reset();
            // Refresh notifications list
            loadNotifications();
        } else {
            alert('Error sending notification');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error sending notification');
    }
});

// Data Loading Functions
async function loadEvents() {
    try {
        // In a real application, this would be an API call
        const events = sampleEvents;
        
        // Update calendar
        const calendar = document.querySelector('#calendar').fullCalendar;
        calendar.removeAllEvents();
        calendar.addEventSource(events.map(event => ({
            title: event.title,
            start: `${event.date}T${event.time}`,
            backgroundColor: event.status === 'completed' ? '#2ecc71' : '#3498db',
            borderColor: event.status === 'completed' ? '#27ae60' : '#2980b9'
        })));
        
        // Update events list
        const eventsList = document.getElementById('eventsList');
        eventsList.innerHTML = events.map(event => `
            <div class="event-card">
                <h3>${event.title} <span class="status-badge status-${event.status}">${event.status}</span></h3>
                <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${event.time}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p>${event.description}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

async function loadVaccinations() {
    try {
        // In a real application, this would be an API call
        const vaccinations = sampleVaccinations;
        
        const vaccinationList = document.getElementById('vaccinationList');
        vaccinationList.innerHTML = vaccinations.map(vaccination => `
            <div class="vaccination-card">
                <h3>${vaccination.petName} <span class="status-badge status-${vaccination.status}">${vaccination.status}</span></h3>
                <p><strong>Vaccine Type:</strong> ${vaccination.vaccineType}</p>
                <p><strong>Vaccination Date:</strong> ${new Date(vaccination.vaccinationDate).toLocaleDateString()}</p>
                <p><strong>Next Due Date:</strong> ${new Date(vaccination.nextDueDate).toLocaleDateString()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading vaccinations:', error);
    }
}

async function loadNotifications() {
    try {
        // In a real application, this would be an API call
        const notifications = sampleNotifications;
        
        const notificationsList = document.getElementById('notificationsList');
        notificationsList.innerHTML = notifications.map(notification => `
            <div class="notification-card">
                <h3>${notification.title} <span class="status-badge status-${notification.status}">${notification.status}</span></h3>
                <p><strong>Type:</strong> ${notification.type}</p>
                <p>${notification.message}</p>
                <p><strong>Recipients:</strong> ${notification.recipients.join(', ')}</p>
                <p><strong>Sent:</strong> ${new Date(notification.sentAt).toLocaleString()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Initial Data Load
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    loadVaccinations();
    loadNotifications();
}); 