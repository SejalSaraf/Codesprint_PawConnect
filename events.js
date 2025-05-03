// DOM Elements
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.main-nav a');
    const contentSections = document.querySelectorAll('.content-section');

    const eventModal = document.getElementById('eventModal');
    const vaccinationModal = document.getElementById('vaccinationModal');
    const notificationModal = document.getElementById('notificationModal');
    const closeButtons = document.querySelectorAll('.close');

    const eventForm = document.getElementById('eventForm');
    const vaccinationForm = document.getElementById('vaccinationForm');
    const notificationForm = document.getElementById('notificationForm');

    const addEventBtn = document.getElementById('addEventBtn');
    const addVaccinationBtn = document.getElementById('addVaccinationBtn');
    const sendNotificationBtn = document.getElementById('sendNotificationBtn');

    let calendar; // will be used in multiple functions

    // Initialize Calendar
    initializeCalendar();

    // Sample content
    initializeSampleContent();

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) section.classList.add('active');
            });
        });
    });

    // Modal Logic
    function openModal(modal) {
        modal.style.display = 'block';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
    }

    addEventBtn.addEventListener('click', () => openModal(eventModal));
    addVaccinationBtn.addEventListener('click', () => openModal(vaccinationModal));
    sendNotificationBtn.addEventListener('click', () => openModal(notificationModal));

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Form Handlers
    eventForm.addEventListener('submit', handleEventSubmit);
    vaccinationForm.addEventListener('submit', handleVaccinationSubmit);
    notificationForm.addEventListener('submit', handleNotificationSubmit);

    async function handleEventSubmit(e) {
        e.preventDefault();

        const formData = {
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            location: document.getElementById('eventLocation').value,
            description: document.getElementById('eventDescription').value
        };

        try {
            await submitEvent(formData);
            addEventToCalendar(formData);
            addEventToList(formData);
            closeModal(eventModal);
            eventForm.reset();
            showNotification('Event added successfully!', 'success');
        } catch {
            showNotification('Error adding event. Please try again.', 'error');
        }
    }

    async function handleVaccinationSubmit(e) {
        e.preventDefault();

        const formData = {
            petName: document.getElementById('petName').value,
            vaccineType: document.getElementById('vaccineType').value,
            vaccinationDate: document.getElementById('vaccinationDate').value,
            nextDueDate: document.getElementById('nextDueDate').value
        };

        try {
            await submitVaccination(formData);
            addVaccinationToList(formData);
            closeModal(vaccinationModal);
            vaccinationForm.reset();
            showNotification('Vaccination scheduled successfully!', 'success');
        } catch {
            showNotification('Error scheduling vaccination. Please try again.', 'error');
        }
    }

    async function handleNotificationSubmit(e) {
        e.preventDefault();

        const formData = {
            type: document.getElementById('notificationType').value,
            title: document.getElementById('notificationTitle').value,
            message: document.getElementById('notificationMessage').value,
            recipients: Array.from(document.getElementById('notificationRecipients').selectedOptions).map(option => option.value)
        };

        try {
            await submitNotification(formData);
            addNotificationToList(formData);
            closeModal(notificationModal);
            notificationForm.reset();
            showNotification('Notification sent successfully!', 'success');
        } catch {
            showNotification('Error sending notification. Please try again.', 'error');
        }
    }

    // Calendar Setup
    function initializeCalendar() {
        const calendarEl = document.getElementById('calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: [],
            eventClick: function (info) {
                showEventDetails(info.event);
            }
        });
        calendar.render();
    }

    function addEventToCalendar(eventData) {
        calendar.addEvent({
            title: eventData.title,
            start: `${eventData.date}T${eventData.time}`,
            extendedProps: {
                description: eventData.description,
                location: eventData.location
            }
        });
    }

    function addEventToList(eventData) {
        const eventsList = document.getElementById('eventsList');
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <h3>${eventData.title}</h3>
            <p><i class="fas fa-calendar"></i> ${formatDate(eventData.date)}</p>
            <p><i class="fas fa-clock"></i> ${eventData.time}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${eventData.location}</p>
            <p>${eventData.description}</p>
        `;
        eventsList.appendChild(eventCard);
    }

    function addVaccinationToList(data) {
        const list = document.getElementById('vaccinationList');
        const card = document.createElement('div');
        card.className = 'vaccination-card';

        const due = new Date(data.nextDueDate);
        const today = new Date();
        const daysUntil = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        let status = 'upcoming', statusClass = 'status-upcoming';

        if (daysUntil < 0) {
            status = 'overdue';
            statusClass = 'status-overdue';
        } else if (daysUntil <= 7) {
            status = 'due-soon';
            statusClass = 'status-due-soon';
        }

        card.innerHTML = `
            <div class="vaccination-header">
                <h3>${data.petName}</h3>
                <span class="status-badge ${statusClass}">${status}</span>
            </div>
            <p><i class="fas fa-syringe"></i> ${data.vaccineType}</p>
            <p><i class="fas fa-calendar"></i> Last Vaccination: ${formatDate(data.vaccinationDate)}</p>
            <p><i class="fas fa-calendar-check"></i> Next Due: ${formatDate(data.nextDueDate)}</p>
            <p><i class="fas fa-clock"></i> ${daysUntil} days ${daysUntil < 0 ? 'overdue' : 'until next vaccination'}</p>
            <div class="vaccination-actions">
                <button class="action-btn reschedule-btn" onclick="rescheduleVaccination('${data.petName}')">
                    <i class="fas fa-calendar-plus"></i> Reschedule
                </button>
                <button class="action-btn reminder-btn" onclick="setReminder('${data.petName}')">
                    <i class="fas fa-bell"></i> Set Reminder
                </button>
            </div>
        `;
        list.appendChild(card);
    }

    function addNotificationToList(data) {
        const list = document.getElementById('notificationsList');
        const card = document.createElement('div');
        card.className = 'notification-card';

        const formattedRecipients = data.recipients.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ');

        card.innerHTML = `
            <div class="notification-header">
                <h3>${data.title}</h3>
                <span class="notification-type ${data.type}">${data.type}</span>
            </div>
            <p class="notification-message">${data.message}</p>
            <div class="notification-details">
                <p><i class="fas fa-users"></i> Sent to: ${formattedRecipients}</p>
                <p><i class="fas fa-clock"></i> ${formatDate(new Date())}</p>
            </div>
            <div class="notification-actions">
                <button class="action-btn resend-btn" onclick="resendNotification('${data.title}')">
                    <i class="fas fa-paper-plane"></i> Resend
                </button>
                <button class="action-btn archive-btn" onclick="archiveNotification('${data.title}')">
                    <i class="fas fa-archive"></i> Archive
                </button>
            </div>
        `;
        list.appendChild(card);
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    async function submitEvent(data) {
        return new Promise(resolve => setTimeout(() => resolve(data), 500));
    }

    async function submitVaccination(data) {
        return new Promise(resolve => setTimeout(() => resolve(data), 500));
    }

    async function submitNotification(data) {
        return new Promise(resolve => setTimeout(() => resolve(data), 500));
    }

    function initializeSampleContent() {
        const sampleVaccinations = [
            { petName: "Max", vaccineType: "Rabies", vaccinationDate: "2024-03-15", nextDueDate: "2025-03-15" },
            { petName: "Luna", vaccineType: "DHPP", vaccinationDate: "2024-02-20", nextDueDate: "2024-08-20" },
            { petName: "Rocky", vaccineType: "Bordetella", vaccinationDate: "2024-03-01", nextDueDate: "2024-09-01" }
        ];

        const sampleNotifications = [
            {
                title: "Upcoming Vaccination Reminder",
                type: "vaccination",
                message: "Max's rabies vaccination is due next week. Please schedule an appointment.",
                recipients: ["staff", "adopters"]
            },
            {
                title: "Adoption Drive Success",
                type: "event",
                message: "Thanks to all who helped — 15 pets found homes!",
                recipients: ["staff", "volunteers", "adopters"]
            },
            {
                title: "New Volunteer Orientation",
                type: "general",
                message: "Join us this Saturday for orientation!",
                recipients: ["volunteers"]
            }
        ];

        sampleVaccinations.forEach(addVaccinationToList);
        sampleNotifications.forEach(addNotificationToList);
    }

    // Exposed functions for action buttons
    window.rescheduleVaccination = function (petName) {
        showNotification(`Opening reschedule form for ${petName}`, 'success');
    };

    window.setReminder = function (petName) {
        showNotification(`Setting reminder for ${petName}'s vaccination`, 'success');
    };

    window.resendNotification = function (title) {
        showNotification(`Resending notification: ${title}`, 'success');
    };

    window.archiveNotification = function (title) {
        showNotification(`Archiving notification: ${title}`, 'success');
    };
});
