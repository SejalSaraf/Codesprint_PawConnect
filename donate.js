document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('donationForm');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        amount: parseFloat(document.getElementById('amount').value),
        purpose: document.getElementById('purpose').value,
        message: document.getElementById('message').value
      };
  
      try {
        const response = await fetch('http://localhost:3000/donate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
  
        const result = await response.json();
        if (response.ok) {
          alert('🎉 Donation successful!');
          form.reset();
        } else {
          alert(`❌ ${result.message}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('🚫 Server error.');
      }
    });
  });
  