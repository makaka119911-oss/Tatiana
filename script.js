// Конфигурация Telegram
const TELEGRAM_BOT_TOKEN = '8402206062:AAEJim1GkriKqY_o1mOo0YWSWQDdw5Qy2h0';
const TELEGRAM_CHAT_ID = '-1002313355102';
const ARCHIVE_PASSWORD = 'rerehepf123'; // Пароль для архива
const API_BASE_URL = 'https://tatiana-server-production.up.railway.app/api';

// Глобальные переменные для теста
let currentStep = 1;
let totalSteps = 7;
let testType = '';
let registrationData = {};
let testData = {};
let archiveData = [];
let itemsPerPage = 10;
let currentPage = 1;

// 🔐 АРХИВ - ПОЛНОСТЬЮ ПЕРЕРАБОТАННЫЙ РАБОЧИЙ КОД
// 🔐 АРХИВ - ПОЛНОСТЬЮ РАБОЧИЙ КОД
const ARCHIVE_PASSWORD = 'rerehepf123';
let archiveData = [];

// 🔄 ОСНОВНАЯ ФУНКЦИЯ ПОКАЗА АРХИВА
function showArchiveSection() {
    console.log('🎯 Открываем раздел архива');
    
    hideAllSections();
    document.getElementById('archive').classList.remove('section-hidden');
    
    initArchive();
    scrollToTop();
}

// 🔐 ИНИЦИАЛИЗАЦИЯ АРХИВА
function initArchive() {
    console.log('🔄 Инициализация архива...');
    
    // Сброс состояния
    showArchiveLoginForm();
    
    // Настройка обработчиков
    setupArchiveEventListeners();
    
    console.log('✅ Архив инициализирован');
}

// 🔐 НАСТРОЙКА ОБРАБОТЧИКОВ АРХИВА
function setupArchiveEventListeners() {
    // Кнопка входа
    const loginBtn = document.getElementById('archiveLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleArchiveLogin);
    }
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('logoutArchiveBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleArchiveLogout);
    }
    
    // Поле пароля (Enter)
    const passwordInput = document.getElementById('archivePassword');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleArchiveLogin();
        });
    }
    
    // Кнопка обновления
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadArchiveData);
    }
    
    // Поиск
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleArchiveSearch);
    }
    
    // Фильтр по уровню
    const levelFilter = document.getElementById('levelFilter');
    if (levelFilter) {
        levelFilter.addEventListener('change', handleArchiveFilter);
    }
}

// 🔐 ПОКАЗ ФОРМЫ ВХОДА В АРХИВ
function showArchiveLoginForm() {
    const loginForm = document.getElementById('archiveLoginForm');
    const archiveContent = document.getElementById('archiveContent');
    
    if (loginForm) {
        loginForm.style.display = 'block';
        loginForm.classList.remove('section-hidden');
    }
    
    if (archiveContent) {
        archiveContent.style.display = 'none';
        archiveContent.classList.add('section-hidden');
    }
    
    // Очистка формы
    clearArchiveForm();
}

// 🔐 ПОКАЗ СОДЕРЖИМОГО АРХИВА
function showArchiveContent() {
    const loginForm = document.getElementById('archiveLoginForm');
    const archiveContent = document.getElementById('archiveContent');
    
    if (loginForm) {
        loginForm.style.display = 'none';
        loginForm.classList.add('section-hidden');
    }
    
    if (archiveContent) {
        archiveContent.style.display = 'block';
        archiveContent.classList.remove('section-hidden');
    }
    
    // Загрузка данных
    loadArchiveData();
}

// 🔐 ОБРАБОТКА ВХОДА В АРХИВ
function handleArchiveLogin() {
    console.log('🔐 Обработка входа в архив...');
    
    const passwordInput = document.getElementById('archivePassword');
    const passwordError = document.getElementById('archivePasswordError');
    const loginBtn = document.getElementById('archiveLoginBtn');
    
    if (!passwordInput || !loginBtn) return;
    
    const password = passwordInput.value.trim();
    const originalText = loginBtn.innerHTML;
    
    try {
        // Показ загрузки
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Проверка...';
        loginBtn.disabled = true;
        
        // Сброс ошибок
        if (passwordError) {
            passwordError.style.display = 'none';
        }
        
        // Проверка пароля
        if (!password) {
            throw new Error('Введите пароль');
        }
        
        if (password !== ARCHIVE_PASSWORD) {
            throw new Error('Неверный пароль');
        }
        
        // Успешная авторизация
        console.log('✅ Пароль верный!');
        localStorage.setItem('archiveAuthenticated', 'true');
        
        // Показ контента
        showArchiveContent();
        
        showSuccessMessage('✅ Доступ к архиву разрешен');
        
    } catch (error) {
        console.error('❌ Ошибка входа:', error);
        
        // Показ ошибки
        if (passwordError) {
            passwordError.textContent = error.message;
            passwordError.style.display = 'block';
        }
        
        // Фокус на поле
        passwordInput.focus();
        passwordInput.select();
        
    } finally {
        // Восстановление кнопки
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
}

// 🔐 ОБРАБОТКА ВЫХОДА ИЗ АРХИВА
function handleArchiveLogout() {
    console.log('🚪 Выход из архива...');
    
    localStorage.removeItem('archiveAuthenticated');
    showArchiveLoginForm();
    showSuccessMessage('✅ Вы вышли из архива');
}

// 🔐 ОЧИСТКА ФОРМЫ АРХИВА
function clearArchiveForm() {
    const passwordInput = document.getElementById('archivePassword');
    const passwordError = document.getElementById('archivePasswordError');
    
    if (passwordInput) passwordInput.value = '';
    if (passwordError) {
        passwordError.style.display = 'none';
        passwordError.textContent = '';
    }
}

// 📊 ЗАГРУЗКА ДАННЫХ АРХИВА
async function loadArchiveData() {
    console.log('📥 Загрузка данных архива...');
    
    try {
        showArchiveLoading();
        
        // Загрузка с сервера
        const serverData = await loadArchiveDataFromServer();
        
        // Резервная загрузка из localStorage
        const localData = loadArchiveDataFromLocal();
        
        // Объединение данных
        archiveData = [...serverData, ...localData];
        
        // Отображение данных
        displayArchiveData(archiveData);
        
        // Обновление статистики
        updateArchiveStats(archiveData);
        
        console.log('✅ Данные архива загружены:', archiveData.length, 'записей');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки архива:', error);
        showArchiveError('Ошибка загрузки данных архива');
    }
}

// 📡 ЗАГРУЗКА ДАННЫХ С СЕРВЕРА
async function loadArchiveDataFromServer() {
    try {
        const response = await fetch(`${API_BASE_URL}/archive`);
        if (response.ok) {
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        }
        return [];
    } catch (error) {
        console.warn('⚠️ Сервер недоступен, используем локальные данные');
        return [];
    }
}

// 💾 ЗАГРУЗКА ДАННЫХ ИЗ LOCALSTORAGE
function loadArchiveDataFromLocal() {
    try {
        const localData = localStorage.getItem('libidoTestArchive');
        return localData ? JSON.parse(localData) : [];
    } catch (error) {
        console.error('❌ Ошибка загрузки локальных данных:', error);
        return [];
    }
}

// 📊 ОТОБРАЖЕНИЕ ДАННЫХ АРХИВА
function displayArchiveData(data) {
    const tableBody = document.getElementById('resultsTableBody');
    const archiveEmpty = document.getElementById('archiveEmpty');
    
    if (!tableBody) return;
    
    // Проверка на пустые данные
    if (!data || data.length === 0) {
        if (tableBody) tableBody.innerHTML = '';
        if (archiveEmpty) {
            archiveEmpty.classList.remove('section-hidden');
        }
        return;
    }
    
    if (archiveEmpty) {
        archiveEmpty.classList.add('section-hidden');
    }
    
    // Заполнение таблицы
    tableBody.innerHTML = data.map(item => `
        <tr>
            <td>
                ${item.photo ? 
                    `<img src="${item.photo}" alt="Фото" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">` : 
                    `<div style="width: 50px; height: 50px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user" style="color: #ccc;"></i>
                    </div>`
                }
            </td>
            <td>
                <strong>${item.firstName} ${item.lastName}</strong>
            </td>
            <td>${item.age || 'Не указан'}</td>
            <td>
                <div>📱 ${item.phone}</div>
                <div>✈️ ${item.telegram}</div>
                ${item.email ? `<div>📧 ${item.email}</div>` : ''}
            </td>
            <td>
                <span class="test-type-badge">
                    ${item.testData?.test_type === 'regular' ? 'Обычный' : 'Менопауза'}
                </span>
            </td>
            <td>
                <span class="level-badge level-badge-${getLevelClass(item.testResult?.level)}">
                    ${item.testResult?.level || 'Не определен'}
                </span>
            </td>
            <td>
                <strong>${item.testResult?.score || 0}</strong>
            </td>
            <td>
                ${item.timestamp ? new Date(item.timestamp).toLocaleDateString('ru-RU') : 'Не указана'}
            </td>
            <td>
                <button class="btn-view-details" onclick="viewUserDetails('${item.id}')" title="Подробнее">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-delete" onclick="deleteUserFromArchive('${item.id}')" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 🎯 ПОЛУЧЕНИЕ КЛАССА ДЛЯ УРОВНЯ
function getLevelClass(level) {
    if (!level) return 'unknown';
    if (level.includes('Низкое')) return 'low';
    if (level.includes('Среднее')) return 'medium';
    if (level.includes('Высокое')) return 'high';
    if (level.includes('Очень высокое')) return 'very-high';
    return 'unknown';
}

// 📈 ОБНОВЛЕНИЕ СТАТИСТИКИ АРХИВА
function updateArchiveStats(data) {
    const totalUsers = document.getElementById('totalUsers');
    const avgScore = document.getElementById('avgScore');
    const completionRate = document.getElementById('completionRate');
    
    if (totalUsers) totalUsers.textContent = data.length;
    
    // Расчет среднего балла
    const scores = data.map(item => item.testResult?.score).filter(score => score);
    const average = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
    if (avgScore) avgScore.textContent = average;
    
    // Процент завершенных тестов
    const completed = data.filter(item => item.testResult).length;
    const rate = data.length ? Math.round((completed / data.length) * 100) : 0;
    if (completionRate) completionRate.textContent = `${rate}%`;
}

// 🔍 ПОИСК В АРХИВЕ
function handleArchiveSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    if (!searchTerm) {
        displayArchiveData(archiveData);
        return;
    }
    
    const filteredData = archiveData.filter(item => 
        item.firstName?.toLowerCase().includes(searchTerm) ||
        item.lastName?.toLowerCase().includes(searchTerm) ||
        item.phone?.includes(searchTerm) ||
        item.telegram?.toLowerCase().includes(searchTerm) ||
        item.email?.toLowerCase().includes(searchTerm)
    );
    
    displayArchiveData(filteredData);
}

// 🎛️ ФИЛЬТРАЦИЯ ПО УРОВНЮ
function handleArchiveFilter() {
    const levelFilter = document.getElementById('levelFilter');
    const selectedLevel = levelFilter ? levelFilter.value : '';
    
    if (!selectedLevel) {
        displayArchiveData(archiveData);
        return;
    }
    
    const filteredData = archiveData.filter(item => 
        item.testResult?.level?.includes(selectedLevel)
    );
    
    displayArchiveData(filteredData);
}

// 👁️ ПРОСМОТР ДЕТАЛЕЙ ПОЛЬЗОВАТЕЛЯ
function viewUserDetails(userId) {
    const user = archiveData.find(item => item.id === userId);
    if (!user) {
        showErrorMessage('Пользователь не найден');
        return;
    }
    
    // Создание модального окна с деталями
    const modalHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Детальная информация</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="user-details">
                        <div class="detail-section">
                            <h4>👤 Личная информация</h4>
                            <p><strong>Имя:</strong> ${user.firstName} ${user.lastName}</p>
                            <p><strong>Возраст:</strong> ${user.age || 'Не указан'}</p>
                            <p><strong>Телефон:</strong> ${user.phone}</p>
                            <p><strong>Telegram:</strong> ${user.telegram}</p>
                            ${user.email ? `<p><strong>Email:</strong> ${user.email}</p>` : ''}
                        </div>
                        
                        <div class="detail-section">
                            <h4>📊 Результаты теста</h4>
                            <p><strong>Уровень либидо:</strong> ${user.testResult?.level || 'Не определен'}</p>
                            <p><strong>Баллы:</strong> ${user.testResult?.score || 0}</p>
                            <p><strong>Тип теста:</strong> ${user.testData?.test_type === 'regular' ? 'Обычный' : 'Менопауза'}</p>
                            <p><strong>Дата прохождения:</strong> ${user.timestamp ? new Date(user.timestamp).toLocaleString('ru-RU') : 'Не указана'}</p>
                        </div>
                        
                        ${user.testResult?.description ? `
                        <div class="detail-section">
                            <h4>📝 Описание результата</h4>
                            <p>${user.testResult.description}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal()">Закрыть</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// 🗑️ УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ АРХИВА
async function deleteUserFromArchive(userId) {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя из архива?')) {
        return;
    }
    
    try {
        // Удаление с сервера
        const serverDeleted = await deleteUserFromServer(userId);
        
        // Удаление из локальных данных
        const localDeleted = deleteUserFromLocal(userId);
        
        if (serverDeleted || localDeleted) {
            // Обновление отображения
            archiveData = archiveData.filter(item => item.id !== userId);
            displayArchiveData(archiveData);
            updateArchiveStats(archiveData);
            
            showSuccessMessage('✅ Пользователь удален из архива');
        } else {
            throw new Error('Не удалось удалить пользователя');
        }
        
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        showErrorMessage('Ошибка при удалении пользователя');
    }
}

// 🗑️ УДАЛЕНИЕ С СЕРВЕРА
async function deleteUserFromServer(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/archive/${userId}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.warn('⚠️ Сервер недоступен, удаляем только локально');
        return false;
    }
}

// 🗑️ УДАЛЕНИЕ ИЗ LOCALSTORAGE
function deleteUserFromLocal(userId) {
    try {
        const localData = loadArchiveDataFromLocal();
        const updatedData = localData.filter(item => item.id !== userId);
        localStorage.setItem('libidoTestArchive', JSON.stringify(updatedData));
        return true;
    } catch (error) {
        console.error('❌ Ошибка удаления из localStorage:', error);
        return false;
    }
}

// 🎯 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ АРХИВА
function showArchiveLoading() {
    const tableBody = document.getElementById('resultsTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--purple-mystic);"></i>
                    <p style="margin-top: 1rem;">Загрузка данных архива...</p>
                </td>
            </tr>
        `;
    }
}

function showArchiveError(message) {
    const tableBody = document.getElementById('resultsTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem;"></i>
                    <p style="margin-top: 1rem;">${message}</p>
                </td>
            </tr>
        `;
    }
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// 🎯 ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Страница загружена, инициализируем архив...');
    
    // Инициализация скрытой кнопки архива
    const archiveHiddenBtn = document.getElementById('archiveHiddenBtn');
    if (archiveHiddenBtn) {
        archiveHiddenBtn.addEventListener('click', function() {
            showArchiveSection();
        });
    }
});
// 🔄 ОСНОВНАЯ ФУНКЦИЯ ПОКАЗА АРХИВА
function showArchiveSection() {
    console.log('🎯 Открываем раздел архива');
    
    // Скрываем все другие секции
    hideAllSections();
    
    // Показываем секцию архива
    const archiveSection = document.getElementById('archive');
    if (archiveSection) {
        archiveSection.classList.remove('section-hidden');
    }
    
    // Инициализируем архив
    initArchive();
    
    // Прокрутка вверх
    scrollToTop();
}

// 🔐 ИНИЦИАЛИЗАЦИЯ АРХИВА
function initArchive() {
    console.log('🔄 Инициализация архива...');
    
    // 1. Настраиваем кнопку входа
    setupArchiveLoginButton();
    
    // 2. Настраиваем кнопку выхода
    setupArchiveLogoutButton();
    
    // 3. Настраиваем поле пароля (Enter)
    setupArchivePasswordField();
    
    // 4. Проверяем авторизацию
    checkArchiveAuth();
    
    console.log('✅ Архив инициализирован');
}

// 🔐 НАСТРОЙКА КНОПКИ ВХОДА В АРХИВ
function setupArchiveLoginButton() {
    const loginBtn = document.getElementById('loginArchiveBtn');
    
    if (!loginBtn) {
        console.error('❌ Кнопка входа в архив не найдена!');
        return;
    }
    
    // Удаляем старые обработчики (клонируем кнопку)
    const newLoginBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
    
    // Добавляем новый обработчик
    newLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🎯 Кнопка "Войти в архив" нажата');
        handleArchiveLogin();
    });
}

// 🔐 НАСТРОЙКА КНОПКИ ВЫХОДА ИЗ АРХИВА
function setupArchiveLogoutButton() {
    const logoutBtn = document.getElementById('logoutArchiveBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🚪 Выход из архива');
            handleArchiveLogout();
        });
    }
}

// 🔐 НАСТРОЙКА ПОЛЯ ПАРОЛЯ (ENTER)
function setupArchivePasswordField() {
    const passwordInput = document.getElementById('archivePassword');
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('⌨️ Нажат Enter в поле пароля');
                handleArchiveLogin();
            }
        });
    }
}

// 🔐 ПРОВЕРКА АВТОРИЗАЦИИ АРХИВА
function checkArchiveAuth() {
    const isAuthenticated = localStorage.getItem('archiveAuthenticated') === 'true';
    console.log('🔐 Статус авторизации архива:', isAuthenticated);
    
    if (isAuthenticated) {
        showArchiveContent();
    } else {
        showArchiveLoginForm();
    }
}

// 🔐 ПОКАЗ ФОРМЫ ВХОДА В АРХИВ
function showArchiveLoginForm() {
    console.log('📝 Показываем форму входа');
    
    const loginForm = document.getElementById('archiveLoginForm');
    const archiveContent = document.getElementById('archiveContent');
    
    if (loginForm) {
        loginForm.style.display = 'block';
        loginForm.classList.remove('section-hidden');
    }
    
    if (archiveContent) {
        archiveContent.style.display = 'none';
        archiveContent.classList.add('section-hidden');
    }
    
    // Очищаем поле пароля и ошибки
    clearArchiveForm();
    
    // Фокус на поле пароля
    setTimeout(() => {
        const passwordInput = document.getElementById('archivePassword');
        if (passwordInput) passwordInput.focus();
    }, 300);
}

// 🔐 ПОКАЗ СОДЕРЖИМОГО АРХИВА
async function showArchiveContent() {
    console.log('📊 Показываем содержимое архива');
    
    const loginForm = document.getElementById('archiveLoginForm');
    const archiveContent = document.getElementById('archiveContent');
    
    if (loginForm) {
        loginForm.style.display = 'none';
        loginForm.classList.add('section-hidden');
    }
    
    if (archiveContent) {
        archiveContent.style.display = 'block';
        archiveContent.classList.remove('section-hidden');
    }
    
    // Загружаем данные архива
    await loadArchiveData();
}

// 🔐 ОБРАБОТКА ВХОДА В АРХИВ
async function handleArchiveLogin() {
    console.log('🔐 Обработка входа в архив...');
    
    const passwordInput = document.getElementById('archivePassword');
    const passwordError = document.getElementById('archivePasswordError');
    const loginBtn = document.getElementById('loginArchiveBtn');
    
    if (!passwordInput || !loginBtn) {
        console.error('❌ Не найдены элементы архива');
        return;
    }
    
    const password = passwordInput.value.trim();
    const originalText = loginBtn.innerHTML;
    
    try {
        // Показываем загрузку
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Проверка...';
        loginBtn.disabled = true;
        
        // Сбрасываем ошибки
        if (passwordError) {
            passwordError.style.display = 'none';
            passwordError.textContent = '';
        }
        
        // Проверяем пароль
        if (!password) {
            throw new Error('Введите пароль');
        }
        
        if (password !== ARCHIVE_PASSWORD) {
            throw new Error('Неверный пароль');
        }
        
        // Успешная авторизация
        console.log('✅ Пароль верный!');
        localStorage.setItem('archiveAuthenticated', 'true');
        
        // Показываем контент архива
        await showArchiveContent();
        
        showSuccessMessage('✅ Доступ к архиву разрешен');
        
    } catch (error) {
        console.error('❌ Ошибка входа:', error);
        
        // Показываем ошибку
        if (passwordError) {
            passwordError.textContent = error.message;
            passwordError.style.display = 'block';
        }
        
        // Фокус на поле пароля
        passwordInput.focus();
        passwordInput.select();
        
    } finally {
        // Восстанавливаем кнопку
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
}

// 🔐 ОБРАБОТКА ВЫХОДА ИЗ АРХИВА
function handleArchiveLogout() {
    console.log('🚪 Выход из архива...');
    
    // Удаляем авторизацию
    localStorage.removeItem('archiveAuthenticated');
    
    // Показываем форму входа
    showArchiveLoginForm();
    
    showSuccessMessage('✅ Вы вышли из архива');
}

// 🔐 ОЧИСТКА ФОРМЫ АРХИВА
function clearArchiveForm() {
    const passwordInput = document.getElementById('archivePassword');
    const passwordError = document.getElementById('archivePasswordError');
    
    if (passwordInput) passwordInput.value = '';
    if (passwordError) {
        passwordError.style.display = 'none';
        passwordError.textContent = '';
    }
}

// 🔄 ЗАГРУЗКА ДАННЫХ АРХИВА
async function loadArchiveData() {
    console.log('📥 Загрузка данных архива...');
    
    try {
        // Показываем индикатор загрузки
        showArchiveLoading();
        
        // Здесь будет загрузка реальных данных
        // Пока используем заглушку
        const archiveData = await fetchArchiveData();
        
        // Отображаем данные
        displayArchiveData(archiveData);
        
        console.log('✅ Данные архива загружены');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки архива:', error);
        showArchiveError('Ошибка загрузки данных архива: ' + error.message);
    }
}

// 📊 ОТОБРАЖЕНИЕ ДАННЫХ АРХИВА
function displayArchiveData(data) {
    console.log('📊 Отображаем данные архива:', data);
    
    const tableBody = document.getElementById('resultsTableBody');
    if (!tableBody) return;
    
    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>Архив пуст</p>
                    <p style="font-size: 0.9rem; color: #666;">Нет данных для отображения</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Здесь будет код отображения реальных данных
    tableBody.innerHTML = `
        <tr>
            <td colspan="9" style="text-align: center; padding: 2rem; color: var(--success-green);">
                <i class="fas fa-check-circle" style="font-size: 2rem;"></i>
                <p style="margin-top: 1rem;">Архив успешно загружен!</p>
                <p style="font-size: 0.9rem;">Для тестирования работы архива</p>
            </td>
        </tr>
    `;
}

// ⏳ ПОКАЗ ЗАГРУЗКИ АРХИВА
function showArchiveLoading() {
    const tableBody = document.getElementById('resultsTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--purple-mystic);"></i>
                    <p style="margin-top: 1rem;">Загрузка данных архива...</p>
                </td>
            </tr>
        `;
    }
}

// ❌ ПОКАЗ ОШИБКИ АРХИВА
function showArchiveError(message) {
    const tableBody = document.getElementById('resultsTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem;"></i>
                    <p style="margin-top: 1rem;">${message}</p>
                </td>
            </tr>
        `;
    }
}

// 📡 ЗАГРУЗКА ДАННЫХ АРХИВА (ЗАГЛУШКА)
async function fetchArchiveData() {
    console.log('📡 Загрузка данных с сервера...');
    
    // Имитация загрузки с сервера
    return new Promise((resolve) => {
        setTimeout(() => {
            // Возвращаем пустой массив для тестирования
            resolve([]);
        }, 1000);
    });
}

// ОСТАЛЬНЫЕ ФУНКЦИИ ТЕСТА И РЕГИСТРАЦИИ

// Функция для перехода между шагами теста
function showStep(stepNumber) {
    console.log('Переход к шагу:', stepNumber);
    
    // Скрываем все шаги
    document.querySelectorAll('.test-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Показываем нужный шаг
    const stepElement = document.getElementById('step' + stepNumber);
    if (stepElement) {
        stepElement.classList.add('active');
        currentStep = stepNumber;
        
        // Обновляем прогресс
        updateProgress();
        
        // Прокрутка к верху
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Функция обновления прогресса
function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    const progressBar = document.getElementById('testProgress');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) progressBar.style.width = progress + '%';
    if (progressText) progressText.textContent = `Шаг ${currentStep} из ${totalSteps}`;
}

// Инициализация теста
function initTest() {
    console.log('Инициализация теста...');
    
    // Обработчик для кнопки "Начать тест" на первом шаге
    const nextFromStep1 = document.getElementById('nextFromStep1');
    if (nextFromStep1) {
        nextFromStep1.addEventListener('click', function() {
            const selectedTestType = document.querySelector('input[name="test_type"]:checked');
            if (!selectedTestType) {
                showNotification('Пожалуйста, выберите тип теста', 'error');
                return;
            }
            
            testType = selectedTestType.value;
            console.log('Выбран тип теста:', testType);
            
            // Для менопаузы пропускаем периоды 1-4
            if (testType === 'menopause') {
                showStep(6); // Переходим сразу к тесту для менопаузы
            } else {
                showStep(2); // Переходим к первому периоду обычного теста
            }
        });
    }
    
    // Обработчик для сезонной зависимости
    document.querySelectorAll('input[name="season_dependency"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const description = document.getElementById('seasonDescription');
            if (description) {
                description.style.display = this.value === 'Да' ? 'block' : 'none';
            }
        });
    });
    
    // Инициализация выбора вариантов ответов
    initTestSteps();
}

// Функция для инициализации кликабельных вариантов ответов
function initTestSteps() {
    document.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                this.parentElement.querySelectorAll('.option-item').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
            }
        });
    });
}

// Функция расчета результата теста
function calculateTestResult(data) {
    let totalScore = 0;
    let maxScore = 100;
    
    // Расчет баллов на основе ответов
    if (data.test_type === 'regular') {
        // Баллы за частоту по периодам
        const frequencyScores = {
            'Вообще не хочется': 1,
            'Хочется 1 раза в неделю': 2,
            'Хочется 1 раз в 3 дня': 3,
            'Хочется через день': 4,
            'Хочется каждый день': 5,
            'Хочется каждый день по много раз': 6
        };
        
        // Баллы за интенсивность
        const intensityScores = {
            'Легкое желание': 1,
            'Среднее желание': 2,
            'Сильное желание': 3,
            'Очень сильное желание': 4,
            'Максимально сильное желание (на столько, что почти невозможно терпеть)': 5
        };
        
        // Баллы за возбуждение
        const arousalScores = {
            'Вообще не возбуждает': 1,
            'Немного возбуждает': 2,
            'Средне возбуждает': 3,
            'Сильно возбуждает': 4,
            'Очень сильно возбуждает': 5
        };
        
        // Считаем баллы за каждый период (1-4)
        for (let i = 1; i <= 4; i++) {
            const periodKey = `period${i}`;
            if (data[`${periodKey}_frequency`]) {
                totalScore += frequencyScores[data[`${periodKey}_frequency`]] || 0;
            }
            if (data[`${periodKey}_intensity`]) {
                totalScore += intensityScores[data[`${periodKey}_intensity`]] || 0;
            }
            if (data[`${periodKey}_arousal_erected`]) {
                totalScore += arousalScores[data[`${periodKey}_arousal_erected`]] || 0;
            }
            if (data[`${periodKey}_arousal_non_erected`]) {
                totalScore += arousalScores[data[`${periodKey}_arousal_non_erected`]] || 0;
            }
        }
    } else {
        // Расчет для менопаузы
        const frequencyScores = {
            'Вообще не хочется': 1,
            'Хочется 1 раза в неделю': 2,
            'Хочется 1 раз в 3 дня': 3,
            'Хочется через день': 4,
            'Хочется каждый день': 5,
            'Хочется каждый день по много раз': 6
        };
        
        const intensityScores = {
            'Легкое желание': 1,
            'Среднее желание': 2,
            'Сильное желание': 3,
            'Очень сильное желание': 4,
            'Максимально сильное желание (на столько, что почти невозможно терпеть)': 5
        };
        
        const arousalScores = {
            'Вообще не возбуждает': 1,
            'Немного возбуждает': 2,
            'Средне возбуждает': 3,
            'Сильно возбуждает': 4,
            'Очень сильно возбуждает': 5
        };
        
        // Основные вопросы менопаузы
        if (data.menopause_frequency) totalScore += frequencyScores[data.menopause_frequency] * 2;
        if (data.menopause_intensity) totalScore += intensityScores[data.menopause_intensity] * 2;
        if (data.menopause_arousal_erected_want) totalScore += arousalScores[data.menopause_arousal_erected_want];
    }
    
    // Нормализуем score до 100
    totalScore = Math.min(totalScore, maxScore);
    
    let level, description;
    
    if (data.test_type === 'regular') {
        if (totalScore <= 25) {
            level = 'Низкое либидо';
            description = 'Ваше либидо находится на низком уровне. Рекомендуется консультация специалиста.';
        } else if (totalScore <= 50) {
            level = 'Среднее либидо';
            description = 'У вас средний уровень либидо. Есть потенциал для усиления.';
        } else if (totalScore <= 75) {
            level = 'Высокое либидо';
            description = 'Поздравляем! У вас высокий уровень либидо.';
        } else {
            level = 'Очень высокое либидо';
            description = 'У вас очень высокий уровень либидо!';
        }
    } else {
        if (totalScore <= 25) {
            level = 'Низкое либидо в менопаузе';
            description = 'Снижение либидо в менопаузе - распространенное явление.';
        } else if (totalScore <= 50) {
            level = 'Среднее либидо в менопаузе';
            description = 'У вас сохраняется умеренный уровень либидо.';
        } else if (totalScore <= 75) {
            level = 'Высокое либидо в менопаузе';
            description = 'Поздравляем! У вас высокий уровень либидо.';
        } else {
            level = 'Очень высокое либидо в менопаузе';
            description = 'У вас исключительно высокий уровень либидо!';
        }
    }
    
    return { level, description, score: totalScore, testType: data.test_type };
}

// Навигация по секциям
function showRegistrationSection() {
    hideAllSections();
    document.getElementById('registration').classList.remove('section-hidden');
    scrollToTop();
}

function showTestSection() {
    hideAllSections();
    document.getElementById('test').classList.remove('section-hidden');
    currentStep = 1;
    updateProgress();
    scrollToTop();
}

function showResultSection() {
    hideAllSections();
    document.getElementById('result').classList.remove('section-hidden');
    scrollToTop();
}

function showAboutSection() {
    hideAllSections();
    document.getElementById('about').classList.remove('section-hidden');
    scrollToTop();
}

function showPowerSection() {
    hideAllSections();
    document.getElementById('power').classList.remove('section-hidden');
    scrollToTop();
}

function showServicesSection() {
    hideAllSections();
    document.getElementById('services').classList.remove('section-hidden');
    scrollToTop();
}

function showProcessSection() {
    hideAllSections();
    document.getElementById('process').classList.remove('section-hidden');
    scrollToTop();
}

function showAwakeningSection() {
    hideAllSections();
    document.getElementById('awakening').classList.remove('section-hidden');
    scrollToTop();
}

function showContactsSection() {
    hideAllSections();
    document.getElementById('contacts').classList.remove('section-hidden');
    scrollToTop();
}

function hideAllSections() {
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('section-hidden');
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Уведомления
function showSuccessMessage(text) {
    showNotification(text, 'success');
}

function showErrorMessage(text) {
    showNotification(text, 'error');
}

function showNotification(text, type) {
    // Удаляем существующие уведомления
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}" 
           style="margin-right: 8px;"></i> 
        ${text}
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function checkDiagnosticStatus() {
    const diagnosticCompleted = localStorage.getItem('diagnosticCompleted') === 'true';
    if (diagnosticCompleted) {
        unlockAllSections();
    }
}

function unlockAllSections() {
    const sections = ['about', 'power', 'services', 'process', 'awakening', 'contacts'];
    
    sections.forEach(section => {
        const lock = document.getElementById(section + 'Lock');
        const content = document.getElementById(section + 'Content');
        
        if (lock) lock.style.display = 'none';
        if (content) content.style.display = 'block';
    });
}

// 🎯 ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Страница загружена, инициализируем архив...');
    
    // Проверяем статус диагностики
    checkDiagnosticStatus();
    
    // Инициализируем тест
    initTest();
    
    // Добавляем обработчик для скрытой кнопки архива
    const archiveHiddenBtn = document.getElementById('archiveHiddenBtn');
    if (archiveHiddenBtn) {
        archiveHiddenBtn.addEventListener('click', function() {
            showArchiveSection();
        });
    }
    
    // Добавляем обработчик для ссылки архива
    const archiveLinks = document.querySelectorAll('.archive-link');
    archiveLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showArchiveSection();
        });
    });
    
    // Навигационные ссылки
    document.querySelectorAll('.registration-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showRegistrationSection();
        });
    });

    document.querySelectorAll('.about-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showAboutSection();
        });
    });

    document.querySelectorAll('.power-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showPowerSection();
        });
    });

    document.querySelectorAll('.services-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showServicesSection();
        });
    });

    document.querySelectorAll('.process-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showProcessSection();
        });
    });

    document.querySelectorAll('.awakening-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showAwakeningSection();
        });
    });

    document.querySelectorAll('.contacts-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showContactsSection();
        });
    });
});
