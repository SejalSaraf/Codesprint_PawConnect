document.getElementById('donationForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get form values
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        amount: document.getElementById('amount').value,
        purpose: document.getElementById('purpose').value,
        message: document.getElementById('message').value
    };

    try {
        // Show loading state
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        // Send data to backend
        const response = await fetch('http://localhost:3000/api/donations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Show success message
            showNotification('Thank you for your donation! We will process it shortly.', 'success');
            
            // Reset the form
            this.reset();
        } else {
            throw new Error(data.error || 'Something went wrong');
        }
    } catch (error) {
        // Show error message
        showNotification(error.message, 'error');
    } finally {
        // Reset button state
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Donation';
    }
});

// Add input validation
document.getElementById('phone').addEventListener('input', function(e) {
    // Remove any non-digit characters
    this.value = this.value.replace(/\D/g, '');
});

document.getElementById('amount').addEventListener('input', function(e) {
    // Ensure amount is positive
    if (this.value < 0) {
        this.value = 0;
    }
});

// Notification function
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to DOM
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add styles for notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    }

    .notification.success {
        background-color: #4CAF50;
    }

    .notification.error {
        background-color: #f44336;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style); 