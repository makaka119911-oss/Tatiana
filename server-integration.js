console.log('✅ Server integration loaded');

// CORRECT API BASE URL for Railway
const API_BASE_URL = 'https://tatiana-server-production.up.railway.app';
const ARCHIVE_PASSWORD = 'tatiana_archive_2024_LBg_makaka_9f3a7c2e8d1b5a4c6';

console.log('🌐 API Base URL:', API_BASE_URL);

// Helper function to convert file to base64
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

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

    // Convert photo to base64 if exists
    let photoBase64 = null;
    if (userPhoto) {
      console.log('📸 Converting photo to base64...');
      photoBase64 = await convertFileToBase64(userPhoto);
    }

    // Prepare data for server
    const serverData = {
      lastName: registrationData.lastName,
      firstName: registrationData.firstName,
      age: parseInt(registrationData.age),
      phone: registrationData.phone,
      telegram: registrationData.telegram,
      photoBase64: photoBase64
    };

    console.log('🔄 Sending to backend:', API_BASE_URL + '/api/register');
    
    const serverResponse = await fetch(API_BASE_URL + '/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serverData)
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

// Update archive system
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
    const tableBody = document.getElementById('archive-table-body');
    
    loading.style.display = 'block';
    tableBody.innerHTML = '<tr><td colspan="7" style="padding: 3rem; text-align: center;">Загрузка данных...</td></tr>';

    try {
      console.log('🔐 Loading archive data...');
      
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
          throw new Error('Неверный пароль доступа');
        }
        throw new Error(`Ошибка сервера: ${response.status}`);
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
        
        showNotification('✅ Данные архива успешно загружены', 'success');
      } else {
        throw new Error(data.error || 'Неверный формат ответа');
      }
    } catch (error) {
      console.error('Error loading archive:', error);
      document.getElementById('archive-error').style.display = 'block';
      document.getElementById('archive-error').textContent = 
        'Ошибка загрузки: ' + error.message;
    } finally {
      loading.style.display = 'none';
    }
  },

  populateArchiveTable: function(records) {
    const tbody = document.getElementById('archive-table-body');

    if (!records || records.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="padding: 4rem; text-align: center; color: #999;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">📭</div>
            <div>Архив пуст</div>
            <small>Нет данных для отображения</small>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = records.map((record, index) => {
      const levelStyle = getLevelStyle(record.level);
      const rowStyle = index % 2 === 0 ? 'background: #fafafa;' : 'background: white;';
      
      return `
        <tr class="archive-row" style="${rowStyle} border-bottom: 1px solid #f0f0f0; transition: all 0.3s ease;">
          <td style="padding: 16px; color: #333; font-weight: 500;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #8B4352, #8B6B9E);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 0.9rem;
              ">
                ${(record.fio || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-weight: 600; color: #2c3e50;">${record.fio || 'Не указано'}</div>
                <div style="font-size: 0.8rem; color: #7f8c8d;">ID: ${record.registrationId || 'N/A'}</div>
              </div>
            </div>
          </td>
          <td style="padding: 16px 12px; text-align: center; color: #666; font-weight: 500;">
            ${record.age || '-'}
          </td>
          <td style="padding: 16px; color: #666;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>📞</span>
              <span>${record.phone || 'Не указан'}</span>
            </div>
          </td>
          <td style="padding: 16px; color: #666;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>✈️</span>
              <span>${record.telegram || 'Не указан'}</span>
            </div>
          </td>
          <td style="padding: 16px 12px; text-align: center;">
            <span style="
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 0.85rem;
              font-weight: 600;
              ${levelStyle}
            ">
              ${getLevelIcon(record.level)} ${record.level || 'Не указан'}
            </span>
          </td>
          <td style="padding: 16px 12px; text-align: center; color: #333; font-weight: 700; font-size: 1.1rem;">
            ${record.score || '0'}
          </td>
          <td style="padding: 16px 12px; text-align: center; color: #999; font-size: 0.9rem;">
            ${record.date ? new Date(record.date).toLocaleDateString('ru-RU') : 'Не указана'}
          </td>
        </tr>
      `;
    }).join('');

    // Update stats
    this.updateArchiveStats(records);
  },

  updateArchiveStats: function(records) {
    if (!records || records.length === 0) {
      document.getElementById('archive-stats').textContent = 'Нет данных для анализа';
      return;
    }
    
    const total = records.length;
    const levels = {
      low: records.filter(r => r.level && r.level.includes('Low')).length,
      medium: records.filter(r => r.level && r.level.includes('Medium')).length,
      high: records.filter(r => r.level && r.level.includes('High') && !r.level.includes('Very')).length,
      veryHigh: records.filter(r => r.level && r.level.includes('Very')).length
    };
    
    const statsText = `
      Всего записей: <strong style="color: #8B4352;">${total}</strong> | 
      🔴 Низкое: <strong>${levels.low}</strong> | 
      🟡 Среднее: <strong>${levels.medium}</strong> | 
      🟢 Высокое: <strong>${levels.high}</strong> | 
      🟣 Очень высокое: <strong>${levels.veryHigh}</strong>
    `;
    
    document.getElementById('archive-stats').innerHTML = statsText;
  }
};

// Helper functions for archive
function getLevelStyle(level) {
  if (!level) return 'background: #f5f5f5; color: #666; border: 1px solid #ddd;';
  
  const styles = {
    'Low': 'background: linear-gradient(135deg, #ffebee, #ffcdd2); color: #c62828; border: 1px solid #ffcdd2;',
    'Medium': 'background: linear-gradient(135deg, #fff3e0, #ffe0b2); color: #ef6c00; border: 1px solid #ffe0b2;',
    'High': 'background: linear-gradient(135deg, #e8f5e9, #c8e6c9); color: #2e7d32; border: 1px solid #c8e6c9;',
    'Very high': 'background: linear-gradient(135deg, #f3e5f5, #e1bee7); color: #7b1fa2; border: 1px solid #e1bee7;'
  };
  
  for (const [key, style] of Object.entries(styles)) {
    if (level.includes(key)) return style;
  }
  
  return 'background: #f5f5f5; color: #666; border: 1px solid #ddd;';
}

function getLevelIcon(level) {
  if (!level) return '❓';
  
  const icons = {
    'Low': '🔴',
    'Medium': '🟡', 
    'High': '🟢',
    'Very high': '🟣'
  };
  
  for (const [key, icon] of Object.entries(icons)) {
    if (level.includes(key)) return icon;
  }
  
  return '❓';
}

console.log('🚀 Server integration initialized successfully');
