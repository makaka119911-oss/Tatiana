// Server integration for registration and test results
// This file overrides handleRegistrationSubmit and handleTestSubmit to send data to Railway server

const API_BASE_URL = 'https://tatiana-server-production.up.railway.app/api';

// Override handleRegistrationSubmit
window.handleRegistrationSubmit = async function(e) {
  e.preventDefault();
  if (!validateRegistrationForm(e.target)) {
    showErrorMessage('Please fill all required fields');
    return;
  }

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  try {
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    registrationData = Object.fromEntries(formData.entries());

    if (!userPhoto) {
      throw new Error('Please upload photo');
    }

    // SEND TO SERVER FIRST
    const serverFormData = new FormData();
    serverFormData.append('lastName', registrationData.lastName);
    serverFormData.append('firstName', registrationData.firstName);
    serverFormData.append('age', registrationData.age);
    serverFormData.append('phone', registrationData.phone);
    serverFormData.append('telegram', registrationData.telegram);
    serverFormData.append('photo', userPhoto);

    const serverResponse = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      body: serverFormData
    });

    if (!serverResponse.ok) {
      const errorData = await serverResponse.json();
      throw new Error(errorData.error || 'Server error');
    }

    const serverData = await serverResponse.json();
    const registrationId = serverData.id;

    console.log('✅ Registration saved to server. ID:', registrationId);
    localStorage.setItem('registrationId', registrationId);

    // THEN send to Telegram
    await sendRegistrationToTelegram(registrationData, userPhoto);

    showSuccessMessage('✅ Registration successful!');
    localStorage.setItem('registrationCompleted', 'true');

    setTimeout(() => showTestSection(), 1500);
  } catch (error) {
    console.error('Registration error:', error);
    showErrorMessage('❌ Error: ' + error.message);
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
};

// Override handleTestSubmit
window.handleTestSubmit = async function(e) {
  e.preventDefault();

  if (!validateStep(6)) {
    showErrorMessage('Please answer all questions');
    return;
  }

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  try {
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    testData = Object.fromEntries(formData.entries());
    const result = calculateTestResult(testData);

    // SEND TO SERVER FIRST
    const registrationId = localStorage.getItem('registrationId');
    
    const testResponse = await fetch(`${API_BASE_URL}/test-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationId: registrationId,
        level: result.level,
        score: result.score,
        testData: testData
      })
    });

    if (!testResponse.ok) {
      throw new Error('Server error');
    }

    console.log('✅ Test results saved to server');

    // Show result
    showTestResult(result);

    // THEN send to Telegram
    await sendTestResultsToTelegram(testData, result);

    localStorage.setItem('diagnosticCompleted', 'true');
    unlockAllSections();
    showSuccessMessage('✅ Test completed!');
  } catch (error) {
    console.error('Test error:', error);
    showErrorMessage('❌ Error: ' + error.message);
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
};

console.log('✅ Server integration loaded');
