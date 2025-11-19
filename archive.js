// Архив с паролем - защита регистрации и результатов тестов
const ARCHIVE_PASSWORD = 'admin19191';
const API_BASE_URL = 'https://tatiana-server-production.up.railway.app/api';

// Инициализация архива при загрузке страницы
document.addEventListener('DOMContentLoaded', initArchive);

function initArchive() {
  // Создаём скрытую кнопку в левом нижнем углу
  const archiveBtn = document.createElement('button');
  archiveBtn.id = 'archive-btn';
  archiveBtn.innerHTML = '<i class="fas fa-vault"></i>';
  archiveBtn.style.cssText = `
    position: fixed;
    bottom: 10px;
    left: 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(139, 67, 82, 0.3);
    border: 2px solid rgba(139, 67, 82, 0.5);
    color: rgba(139, 67, 82, 0.5);
    cursor: pointer;
    opacity: 0.25;
    transition: all 0.3s ease;
    z-index: 999;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  archiveBtn.onmouseover = () => {
    archiveBtn.style.opacity = '0.6';
    archiveBtn.style.background = 'rgba(139, 67, 82, 0.6)';
  };
  
  archiveBtn.onmouseout = () => {
    archiveBtn.style.opacity = '0.25';
    archiveBtn.style.background = 'rgba(139, 67, 82, 0.3)';
  };
  
  archiveBtn.onclick = openArchiveModal;
  document.body.appendChild(archiveBtn);
  
  // Создаём модальное окно архива
  createArchiveModal();
}

function createArchiveModal() {
  const modal = document.createElement('div');
  modal.id = 'archive-modal';
  modal.style.cssText = `
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 10000;
    align-items: center;
    justify-content: center;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 20px; padding: 30px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #8B4352; margin-bottom: 10px;"><i class="fas fa-lock"></i> Архив</h2>
        <p style="color: #999; margin: 0;">Введите пароль для доступа</p>
      </div>
      
      <div id="archive-login" style="display: block;">
        <div style="margin-bottom: 20px;">
          <input type="password" id="archive-password" placeholder="Пароль" 
                 style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;">
        </div>
        <button id="archive-login-btn" 
                style="width: 100%; padding: 12px; background: linear-gradient(135deg, #D46A6A, #8B6B9E); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">
          Войти
        </button>
        <div id="archive-error" style="color: #e74c3c; text-align: center; margin-top: 10px; display: none;">Неверный пароль!</div>
      </div>
      
      <div id="archive-content" style="display: none;">
        <div style="margin-bottom: 20px; text-align: right;">
          <button id="archive-logout-btn" style="background: #ccc; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
            Выход
          </button>
        </div>
        <h3 style="color: #8B4352; margin-bottom: 20px;">Таблица архива</h3>
        <div id="archive-table-container" style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">ФИО</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Дата</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Результат теста</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Телефон</th>
              </tr>
            </thead>
            <tbody id="archive-table-body">
            </tbody>
          </table>
        </div>
        <div id="archive-loading" style="text-align: center; padding: 20px; display: none;">
          <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #8B4352;"></i>
        </div>
      </div>
      
      <button id="archive-close-btn" 
              style="position: absolute; top: 15px; right: 15px; width: 30px; height: 30px; border: none; background: #eee; border-radius: 50%; cursor: pointer; font-size: 18px;">
        ×
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Обработчики
  document.getElementById('archive-login-btn').onclick = handleArchiveLogin;
  document.getElementById('archive-logout-btn').onclick = handleArchiveLogout;
  document.getElementById('archive-close-btn').onclick = closeArchiveModal;
  document.getElementById('archive-password').onkeypress = (e) => {
    if (e.key === 'Enter') handleArchiveLogin();
  };
  
  modal.onclick = (e) => {
    if (e.target === modal) closeArchiveModal();
  };
}

function openArchiveModal() {
  document.getElementById('archive-modal').style.display = 'flex';
  document.getElementById('archive-password').focus();
}

function closeArchiveModal() {
  document.getElementById('archive-modal').style.display = 'none';
  document.getElementById('archive-password').value = '';
  document.getElementById('archive-error').style.display = 'none';
  document.getElementById('archive-login').style.display = 'block';
  document.getElementById('archive-content').style.display = 'none';
}

function handleArchiveLogin() {
  const password = document.getElementById('archive-password').value;
  
  if (password === ARCHIVE_PASSWORD) {
    document.getElementById('archive-error').style.display = 'none';
    document.getElementById('archive-login').style.display = 'none';
    document.getElementById('archive-content').style.display = 'block';
    loadArchiveData();
  } else {
    document.getElementById('archive-error').style.display = 'block';
    document.getElementById('archive-password').value = '';
  }
}

function handleArchiveLogout() {
  closeArchiveModal();
}

async function loadArchiveData() {
  const loading = document.getElementById('archive-loading');
  loading.style.display = 'block';
  
  try {
    const response = await fetch(`${API_BASE_URL}/archive`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ARCHIVE_PASSWORD}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.json();
    populateArchiveTable(data);
  } catch (error) {
    console.error('Ошибка загрузки архива:', error);
    document.getElementById('archive-table-body').innerHTML = 
      '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #e74c3c;">Ошибка загрузки данных: ' + error.message + '</td></tr>';
  } finally {
    loading.style.display = 'none';
  }
}

function populateArchiveTable(records) {
  const tbody = document.getElementById('archive-table-body');
  
  if (!records || records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #999;">Нет записей</td></tr>';
    return;
  }
  
  tbody.innerHTML = records.map(record => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 10px; border: 1px solid #ddd;">${record.fio || 'N/A'}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${new Date(record.date).toLocaleDateString('ru-RU')}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${record.testResult || 'N/A'}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${record.phone || 'N/A'}</td>
    </tr>
  `).join('');
}

// Экспорт для использования в других модулях
window.ArchiveSystem = {
  openArchive: openArchiveModal,
  closeArchive: closeArchiveModal,
  loadData: loadArchiveData
};
