// Minimum viable script.js with backend integration
const API_URL = 'http://localhost:3000';
const ARCHIVE_PASSWORD = 'admin123';
let registrationId = null;
let testType = '';

// Registration form handler
async function handleRegistrationSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  try {
    const data = {
      lastName: form.lastName.value,
      firstName: form.firstName.value,
      age: parseInt(form.age.value),
      phone: form.phone.value,
      telegram: form.telegram.value
    };
    const response = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (result.success) {
      registrationId = result.registrationId;
      alert('Registration saved! Moving to test...');
      document.getElementById('test').style.display = 'block';
      document.getElementById('registration').style.display = 'none';
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Registration failed: ' + error.message);
  } finally {
    submitBtn.disabled = false;
  }
}

// Test form handler
async function handleTestSubmit(e) {
  e.preventDefault();
  if (!registrationId) {
    alert('Please register first');
    return;
  }
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  try {
    const formData = new FormData(form);
    const testData = Object.fromEntries(formData);
    const response = await fetch(`${API_URL}/api/test-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationId: registrationId,
        testData: testData,
        level: 'High libido',
        score: 75
      })
    });
    const result = await response.json();
    if (result.success) {
      alert('Test results saved successfully!');
      document.getElementById('result').style.display = 'block';
      document.getElementById('test').style.display = 'none';
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Test submission failed: ' + error.message);
  } finally {
    submitBtn.disabled = false;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('registrationForm');
  if (regForm) regForm.addEventListener('submit', handleRegistrationSubmit);
  const testForm = document.getElementById('libidoTestForm');
  if (testForm) testForm.addEventListener('submit', handleTestSubmit);
});
