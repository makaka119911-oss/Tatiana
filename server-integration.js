console.log('✅ Server integration loaded');

// CORRECT API BASE URL for Railway
const API_BASE_URL = 'https://tatiana-server-production.up.railway.app';
const ARCHIVE_PASSWORD = 'tatiana_archive_2024_LBg_makaka_9f3a7c2e8d1b5a4c6';

console.log('🌐 API Base URL:', API_BASE_URL);

// Override handleRegistrationSubmit
window.handleRegistrationSubmit = async function(e) {
  e.preventDefault();
  
  if (!validateRegistrationForm(e.target)) {
    showErrorMessage('Пожалуйста, заполните все обязательные поля корректно');
    return;
  }

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  try {
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
    submitBtn.disabled = true;

    // Collect form data
    const formData = new FormData(form);
    const registrationData = Object.fromEntries(formData.entries());
    
    console.log('📝 Starting registration process...', registrationData);

    // Send to backend API
    console.log('🔄 Sending to backend:', API_BASE_URL + '/api/register');
    
    const serverResponse = await fetch(API_BASE_URL + '/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData)
    });

    console.log('📨 Server response status:', serverResponse.status);
    
    const responseData = await serverResponse.json();
    console.log('📊 Server response:', responseData);

    if (!serverResponse.ok) {
      throw new Error(responseData.error || `HTTP ${serverResponse.status}`);
    }

    if (!responseData.success) {
      throw new Error(responseData.error || 'Registration failed');
    }

    // Save registration ID for test results
    const registrationId = responseData.registrationId;
    localStorage.setItem('registrationId', registrationId);
    window.registrationId = registrationId;

    console.log('✅ Registration successful, ID:', registrationId);
    
    showSuccessMessage('✅ Регистрация успешно завершена! Переходим к тесту.');
    localStorage.setItem('registrationCompleted', 'true');

    // Move to test section
    setTimeout(() => {
      showTestSection();
    }, 1500);

  } catch (error) {
    console.error('❌ Registration failed:', error);
    
    let errorMessage = 'Ошибка регистрации: ';
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Не удалось подключиться к серверу. Проверьте интернет-соединение.';
    } else if (error.message.includes('HTTP 5')) {
      errorMessage = 'Временная проблема с сервером. Попробуйте позже.';
    } else if (error.message.includes('HTTP 4')) {
      errorMessage = 'Ошибка в данных: ' + error.message;
    } else {
      errorMessage += error.message;
    }
    
    showErrorMessage(errorMessage);
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
};

// Override handleTestSubmit
window.handleTestSubmit = async function(e) {
  e.preventDefault();

  if (!validateStep(6)) {
    showErrorMessage('Пожалуйста, ответьте на все обязательные вопросы этого шага');
    return;
  }

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  try {
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обработка результатов...';
    submitBtn.disabled = true;

    // Get registration ID
    const registrationId = localStorage.getItem('registrationId');
    if (!registrationId) {
      throw new Error('Не найден ID регистрации. Пожалуйста, начните с регистрации.');
    }

    // Collect test data
    const formData = new FormData(form);
    const testData = Object.fromEntries(formData.entries());
    
    // Calculate result
    const result = calculateTestResult(testData);
    console.log('🧪 Test result calculated:', result);

    // Send to backend API
    const testResponse = await fetch(API_BASE_URL + '/api/test-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registrationId: registrationId,
        testData: testData,
        level: result.level,
        score: result.score
      })
    });

    console.log('📨 Test response status:', testResponse.status);
    
    const testResponseData = await testResponse.json();
    console.log('📊 Test response:', testResponseData);

    if (!testResponse.ok) {
      throw new Error(testResponseData.error || `HTTP ${testResponse.status}`);
    }

    if (!testResponseData.success) {
      throw new Error(testResponseData.error || 'Test submission failed');
    }

    console.log('✅ Test results saved successfully');

    // Show results to user
    showTestResult(result);

    // Unlock all sections
    localStorage.setItem('diagnosticCompleted', 'true');
    unlockAllSections();
    
    showSuccessMessage('✅ Диагностика завершена! Теперь вам доступны все разделы сайта.');

  } catch (error) {
    console.error('❌ Test submission failed:', error);
    
    let errorMessage = 'Ошибка сохранения результатов: ';
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Не удалось подключиться к серверу. Проверьте интернет-соединение.';
    } else {
      errorMessage += error.message;
    }
    
    showErrorMessage(errorMessage);
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
};

// Archive functions
window.ArchiveSystem = {
  openArchive: function() {
    document.getElementById('archive-modal').style.display = 'flex';
    document.getElementById('archive-password').focus();
  },

  closeArchive: function() {
    document.getElementById('archive-modal').style.display = 'none';
    document.getElementById('archive-password').value = '';
    document.getElementById('archive-error').style.display = 'none';
    document.getElementById('archive-login').style.display = 'block';
    document.getElementById('archive-content').style.display = 'none';
  },

  loadData: async function() {
    const loading = document.getElementById('archive-loading');
    const password = document.getElementById('archive-password').value;

    loading.style.display = 'block';

    try {
      console.log('🔐 Archive auth attempt');
      
      // Verify password
      if (password !== ARCHIVE_PASSWORD) {
        throw new Error('Invalid password');
      }

      // Fetch from server
      const response = await fetch(API_BASE_URL + '/api/archive', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ARCHIVE_PASSWORD}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📨 Archive response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid password');
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Archive data received:', data);
      
      if (data.success && data.records) {
        window.archiveData = data.records;
        this.populateArchiveTable(window.archiveData);
        
        // Show archive content
        document.getElementById('archive-login').style.display = 'none';
        document.getElementById('archive-content').style.display = 'block';
        document.getElementById('archive-error').style.display = 'none';
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error loading archive:', error);
      document.getElementById('archive-error').style.display = 'block';
      document.getElementById('archive-error').textContent = 
        error.message === 'Invalid password' ? 'Неверный пароль!' : 'Ошибка загрузки данных: ' + error.message;
    } finally {
      loading.style.display = 'none';
    }
  },

  populateArchiveTable: function(records) {
    const tbody = document.getElementById('archive-table-body');

    if (!records || records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="padding: 2rem; text-align: center; color: #999;">Нет записей</td></tr>';
      return;
    }

    tbody.innerHTML = records.map((record, idx) => `
      <tr style="border-bottom: 1px solid #eee; ${idx % 2 === 0 ? 'background: #f9f9f9;' : ''}">
        <td style="padding: 12px; color: #333;">${record.fio || 'N/A'}</td>
        <td style="padding: 12px; color: #666;">${record.age || 'N/A'}</td>
        <td style="padding: 12px; color: #666;">${record.phone || 'N/A'}</td>
        <td style="padding: 12px; color: #666;">${record.telegram || 'N/A'}</td>
        <td style="padding: 12px;">
          <span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;
            ${record.level?.includes('Low') ? 'background: #ffebee; color: #c62828;' : ''}
            ${record.level?.includes('Medium') ? 'background: #fff3e0; color: #ef6c00;' : ''}
            ${record.level?.includes('High') && !record.level?.includes('Very') ? 'background: #e8f5e9; color: #2e7d32;' : ''}
            ${record.level?.includes('Very') ? 'background: #f3e5f5; color: #7b1fa2;' : ''}
          ">${record.level || 'N/A'}</span>
        </td>
        <td style="padding: 12px; text-align: center; color: #333; font-weight: 600;">${record.score || '-'}</td>
        <td style="padding: 12px; text-align: center; color: #999; font-size: 13px;">${new Date(record.date).toLocaleDateString('ru-RU')}</td>
      </tr>
    `).join('');
  },

  filterArchiveTable: function() {
    const search = document.getElementById('archive-search').value.toLowerCase();
    const filter = document.getElementById('archive-filter').value;
    const tbody = document.getElementById('archive-table-body');

    if (!window.archiveData) return;

    const filtered = window.archiveData.filter(record => {
      const fullName = (record.fio || '').toLowerCase();
      const matchSearch = !search || fullName.includes(search);
      const matchFilter = !filter || (record.level || '').includes(filter);
      return matchSearch && matchFilter;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="padding: 2rem; text-align: center; color: #999;">Совпадений не найдено</td></tr>';
    } else {
      this.populateArchiveTable(filtered);
    }
  }
};

console.log('🚀 Server integration initialized successfully');
