// Tatiana LibidoTest Frontend - Integration with Railway Backend
const API_BASE_URL = 'https://tatiana-server-production.up.railway.app/api/archive';
const ARCHIVE_PASSWORD = 'admin19191';
let registrationId = null;
let testType = '';

// ============ Registration Form Handler ============
async function handleRegistrationSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  
  try {
    const registrationData = {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      age: parseInt(form.age.value),
      phone: form.phone.value,
      telegram: form.telegram.value
    };
    
    // Send registration data to server
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      registrationId = result.data.user_id;
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

// ============ Test Form Handler ============
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
    
    // Calculate libido level based on test responses
    const libidonLevel = calculateLibidonLevel(testData);
    
    // Send test results to server
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: registrationId,
        libido_level: libidonLevel,
        test_data: testData,
        test_result: { score: 75, level: libidonLevel }
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

// ============ Helper Function to Calculate Libido Level ============
function calculateLibidonLevel(testData) {
  // Simple calculation - count positive responses
  // You can make this more complex based on your test logic
  const score = Object.values(testData).filter(v => v === 'yes' || v === 'true').length;
  
  if (score >= 8) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
}

// ============ Display Archive Handler ============
async function displayArchive() {
  const password = prompt('Enter archive password:');
  
  if (!password) {
    alert('Password required');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}?password=${password}`);
    const archiveData = await response.json();
    
    if (response.ok) {
      displayArchiveTable(archiveData);
    } else {
      alert('Error: ' + archiveData.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to load archive: ' + error.message);
  }
}

// ============ Display Archive Table ============
function displayArchiveTable(data) {
  let html = '<table border="1"><tr>';
  html += '<th>FIO</th><th>Date</th><th>Libido Level</th><th>Phone</th><th>Email</th>';
  html += '</tr>';
  
  data.forEach(row => {
    html += `<tr>
      <td>${row.fio}</td>
      <td>${new Date(row.date).toLocaleDateString()}</td>
      <td>${row.testResult}</td>
      <td>${row.phone}</td>
      <td>${row.email}</td>
    </tr>`;
  });
  
  html += '</table>';
  document.getElementById('archiveContainer').innerHTML = html;
}

// ============ Search by Last Name ============
async function searchByLastName(lastName) {
  const password = 'admin19191'; // Use the password
  
  try {
    const response = await fetch(`${API_BASE_URL}?password=${password}`);
    const allData = await response.json();
    
    if (response.ok) {
      const filtered = allData.filter(row => row.fio.includes(lastName));
      displayArchiveTable(filtered);
    } else {
      alert('Error: ' + allData.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Search failed: ' + error.message);
  }
}

// ============ Search by Libido Level ============
async function searchByLibido(libidonLevel) {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/archive', '/archive/filter')}/${libidonLevel}`);
    const filteredData = await response.json();
    
    if (response.ok) {
      displayArchiveTable(filteredData.map(row => ({
        fio: `${row.first_name} ${row.last_name}`,
        date: row.created_at,
        testResult: row.libido_level,
        phone: row.phone,
        email: row.email
      })));
    } else {
      alert('Error: ' + filteredData.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Search failed: ' + error.message);
  }
}

// ============ Event Listeners ============
document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('registrationForm');
  if (regForm) regForm.addEventListener('submit', handleRegistrationSubmit);
  
  const testForm = document.getElementById('libidoTestForm');
  if (testForm) testForm.addEventListener('submit', handleTestSubmit);
  
  // Add event listeners for archive buttons if they exist
  const archiveBtn = document.getElementById('viewArchiveBtn');
  if (archiveBtn) archiveBtn.addEventListener('click', displayArchive);
});

// ============ Helper: Format Phone Numbers ============
function formatPhone(phone) {
  return phone.replace(/[\D]/g, '').substring(0, 11);
}

// ============ Helper: Validate Email ============
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
