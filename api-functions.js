// API Configuration
const API_BASE_URL = 'https://tatiana-server-production.up.railway.app/api';

// Обновленная функция сохранения в архив
async function saveToArchive(userData, testData, testResult) {
    try {
        const response = await fetch(`${API_BASE_URL}/archive`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: userData.firstName,
                lastName: userData.lastName,
                age: userData.age,
                phone: userData.phone,
                email: userData.email,
                telegram: userData.telegram,
                photo: userData.photo || null,
                testData: testData,
                testResult: testResult,
                libidonLevel: testResult.level
            })
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Данные сохранены на сервер');
            showNotification('✅ Данные сохранены на сервер', 'success');
            return true;
        } else {
            throw new Error(result.error || 'Ошибка сохранения');
        }
    } catch (error) {
        console.error('❌ Ошибка сохранения на сервер:', error);
        showNotification('❌ Ошибка сохранения: ' + error.message, 'error');
        return false;
    }
}

// Обновленная функция загрузки данных архива
async function loadArchiveData() {
    try {
        const response = await fetch(`${API_BASE_URL}/archive`);
        if (response.ok) {
            const serverData = await response.json();
            console.log('✅ Данные загружены с сервера:', serverData);
            return serverData;
        } else {
            console.warn('⚠️ Ошибка загрузки с сервера');
            return [];
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки с сервера:', error);
        return [];
    }
}

// Функция поиска по уровню либидо
async function searchArchiveByLevel(libidonLevel) {
    try {
        const response = await fetch(`${API_BASE_URL}/archive/filter/${libidonLevel}`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Данные найдены:', data);
            return data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('❌ Ошибка поиска:', error);
        return [];
    }
}

// Функция удаления пользователя
async function deleteUserDataFromServer(userId) {
    if (!confirm('Вы уверены, что хотите удалить данные этого пользователя?')) {
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/archive/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('✅ Данные пользователя удалены', 'success');
            return true;
        } else {
            throw new Error('Failed to delete from server');
        }
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        showNotification('❌ Ошибка удаления: ' + error.message, 'error');
        return false;
    }
}

// Health check функция
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Сервер доступен');
            return true;
        } else {
            console.warn('⚠️ Сервер недоступен');
            return false;
        }
    } catch (error) {
        console.error('❌ Сервер не отвечает:', error);
        return false;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    const isOnline = await checkServerHealth();
    if (isOnline) {
        console.log('✅ API сервер подключен и готов к работе');
    } else {
        console.warn('⚠️ API сервер недоступен. Проверьте соединение.');
    }
});

// Функция для входа в архив (новая)
async function loginToArchive(password) {
    try {
        const response = await fetch(`${API_BASE_URL}/archive/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('✅ Вход в архив успешен');
            return true;
        } else {
            throw new Error(result.message || 'Неверный пароль');
        }
    } catch (error) {
        console.error('❌ Ошибка входа в архив:', error);
        showNotification('❌ Ошибка входа: ' + error.message, 'error');
        return false;
    }
}
