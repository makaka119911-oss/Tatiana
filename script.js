// Конфигурация Telegram
const TELEGRAM_BOT_TOKEN = '8402206062:AAEJim1GkriKqY_o1mOo0YWSWQDdw5Qy2h0';
const TELEGRAM_CHAT_ID = '-1002313355102';
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
// ==================== АРХИВ - ПОЛНОСТЬЮ РАБОЧИЙ КОД ====================
const ARCHIVE_PASSWORD = 'rerehepf123';

// 🔄 ОСНОВНАЯ ФУНКЦИЯ ПОКАЗА АРХИВА
function showArchiveSection() {
    console.log('🎯 Открываем раздел архива');
    
    hideAllSections();
    document.getElementById('archive').classList.remove('section-hidden');
    
    // Сброс состояния архива
    showArchiveLoginForm();
    
    scrollToTop();
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
    
    // Очистка поля пароля
    const passwordInput = document.getElementById('archivePassword');
    const passwordError = document.getElementById('archivePasswordError');
    
    if (passwordInput) passwordInput.value = '';
    if (passwordError) {
        passwordError.style.display = 'none';
        passwordError.textContent = '';
    }
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
    
    // Загрузка данных архива
    loadArchiveData();
}

// 🔐 ОБРАБОТКА ВХОДА В АРХИВ
function handleArchiveLogin() {
    console.log('🔐 Обработка входа в архив...');
    
    const passwordInput = document.getElementById('archivePassword');
    const passwordError = document.getElementById('archivePasswordError');
    
    if (!passwordInput) {
        console.error('❌ Не найдено поле пароля');
        return;
    }
    
    const password = passwordInput.value.trim();
    
    try {
        // Проверка пароля
        if (!password) {
            throw new Error('Введите пароль');
        }
        
        if (password !== ARCHIVE_PASSWORD) {
            throw new Error('Неверный пароль');
        }
        
        // Успешная авторизация
        console.log('✅ Пароль верный!');
        
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
        
        // Фокус на поле пароля
        passwordInput.focus();
        passwordInput.select();
    }
}

// 🔐 ОБРАБОТКА ВЫХОДА ИЗ АРХИВА
function handleArchiveLogout() {
    console.log('🚪 Выход из архива...');
    
    showArchiveLoginForm();
    showSuccessMessage('✅ Вы вышли из архива');
}

// 📊 ЗАГРУЗКА ДАННЫХ АРХИВА
function loadArchiveData() {
    console.log('📥 Загрузка данных архива...');
    
    try {
        showArchiveLoading();
        
        // Загрузка из localStorage
        const archive = JSON.parse(localStorage.getItem('libidoTestArchive')) || [];
        
        // Отображение данных
        displayArchiveData(archive);
        
        // Обновление статистики
        updateArchiveStats(archive);
        
        console.log('✅ Данные архива загружены:', archive.length, 'записей');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки архива:', error);
        showArchiveError('Ошибка загрузки данных архива');
    }
}

// 📊 ОТОБРАЖЕНИЕ ДАННЫХ АРХИВА
function displayArchiveData(data) {
    const tableBody = document.getElementById('resultsTableBody');
    const archiveEmpty = document.getElementById('archiveEmpty');
    
    if (!tableBody) return;
    
    // Проверка на пустые данные
    if (!data || data.length === 0) {
        tableBody.innerHTML = '';
        if (archiveEmpty) {
            archiveEmpty.style.display = 'block';
            archiveEmpty.classList.remove('section-hidden');
        }
        return;
    }
    
    if (archiveEmpty) {
        archiveEmpty.style.display = 'none';
        archiveEmpty.classList.add('section-hidden');
    }
    
    // Заполнение таблицы
    tableBody.innerHTML = data.map(item => {
        const levelClass = getLevelClass(item.testResult?.level || item.libidonLevel);
        const testType = (item.testData?.test_type === 'regular' || item.testType === 'regular') ? 'Обычный' : 'Менопауза';
        const score = item.testResult?.score || 0;
        const level = item.testResult?.level || item.libidonLevel || 'Не определен';
        const date = item.timestamp ? new Date(item.timestamp).toLocaleDateString('ru-RU') : 'Не указана';
        
        return `
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
                    <strong>${item.firstName || ''} ${item.lastName || ''}</strong>
                </td>
                <td>${item.age || 'Не указан'}</td>
                <td>
                    <div>📱 ${item.phone || ''}</div>
                    <div>✈️ ${item.telegram || ''}</div>
                </td>
                <td>
                    <span class="test-type-badge">${testType}</span>
                </td>
                <td>
                    <span class="level-badge level-badge-${levelClass}">${level}</span>
                </td>
                <td>
                    <strong>${score}</strong>
                </td>
                <td>${date}</td>
                <td>
                    <button class="btn-view-details" onclick="viewUserDetails('${item.id}')" title="Подробнее">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteUserFromArchive('${item.id}')" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
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
    const scores = data.map(item => item.testResult?.score).filter(score => score !== undefined && score !== null);
    const average = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
    if (avgScore) avgScore.textContent = average;
    
    // Процент завершенных тестов
    const completed = data.filter(item => item.testResult || item.testData).length;
    const rate = data.length ? Math.round((completed / data.length) * 100) : 0;
    if (completionRate) completionRate.textContent = `${rate}%`;
}

// 🗑️ УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ АРХИВА
function deleteUserFromArchive(userId) {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя из архива?')) {
        return;
    }
    
    try {
        // Удаление из локальных данных
        const archive = JSON.parse(localStorage.getItem('libidoTestArchive')) || [];
        const updatedArchive = archive.filter(item => item.id !== userId);
        localStorage.setItem('libidoTestArchive', JSON.stringify(updatedArchive));
        
        // Обновление отображения
        loadArchiveData();
        
        showSuccessMessage('✅ Пользователь удален из архива');
        
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        showErrorMessage('Ошибка при удалении пользователя');
    }
}

// 👁️ ПРОСМОТР ДЕТАЛЕЙ ПОЛЬЗОВАТЕЛЯ
function viewUserDetails(userId) {
    const archive = JSON.parse(localStorage.getItem('libidoTestArchive')) || [];
    const user = archive.find(item => item.id === userId);
    
    if (!user) {
        showErrorMessage('Пользователь не найден');
        return;
    }
    
    // Создание модального окна
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
                        </div>
                        
                        <div class="detail-section">
                            <h4>📊 Результаты теста</h4>
                            <p><strong>Уровень либидо:</strong> ${user.testResult?.level || user.libidonLevel || 'Не определен'}</p>
                            <p><strong>Баллы:</strong> ${user.testResult?.score || 0}</p>
                            <p><strong>Тип теста:</strong> ${(user.testData?.test_type === 'regular' || user.testType === 'regular') ? 'Обычный' : 'Менопауза'}</p>
                            <p><strong>Дата прохождения:</strong> ${user.timestamp ? new Date(user.timestamp).toLocaleString('ru-RU') : 'Не указана'}</p>
                        </div>
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

// ❌ ПОКАЗ ЗАГРУЗКИ АРХИВА
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

// 🔒 ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// 🎯 ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ АРХИВА
function initArchiveHandlers() {
    // Обработчик для кнопки входа
    const loginBtn = document.getElementById('archiveLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleArchiveLogin);
    }
    
    // Обработчик для кнопки выхода
    const logoutBtn = document.getElementById('logoutArchiveBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleArchiveLogout);
    }
    
    // Обработчик для поля пароля (Enter)
    const passwordInput = document.getElementById('archivePassword');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleArchiveLogin();
            }
        });
    }
    
    // Обработчик для скрытой кнопки архива
    const archiveHiddenBtn = document.getElementById('archiveHiddenBtn');
    if (archiveHiddenBtn) {
        archiveHiddenBtn.addEventListener('click', function() {
            showArchiveSection();
        });
    }
}

// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Страница загружена, инициализируем архив...');
    initArchiveHandlers();
});

// 🔄 ОБНОВЛЕНИЕ ФУНКЦИИ СОХРАНЕНИЯ РЕЗУЛЬТАТОВ ТЕСТА
// Добавьте этот код в функцию handleTestSubmit после расчета результата:

async function handleTestSubmit(e) {
    e.preventDefault();
    
    // ... существующий код ...
    
    // После расчета результата добавляем сохранение в архив:
    const result = calculateTestResult(testData);
    
    // Сохраняем в архив
    const archiveItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...registrationData,
        testData: testData,
        testResult: result,
        libidonLevel: result.level,
        testType: testData.test_type
    };

    const archive = JSON.parse(localStorage.getItem('libidoTestArchive')) || [];
    archive.push(archiveItem);
    localStorage.setItem('libidoTestArchive', JSON.stringify(archive));
    
    // ... остальной код ...
}



// ОСТАЛЬНЫЕ ФУНКЦИИ ТЕСТА И РЕГИСТРАЦИИ
// Функция для перехода между шагами теста
function showStep(stepNumber) {
    console.log('Переход к шагу:', stepNumber);
    
    document.querySelectorAll('.test-step').forEach(step => {
        step.classList.remove('active');
    });
    
    const stepElement = document.getElementById('step' + stepNumber);
    if (stepElement) {
        stepElement.classList.add('active');
        currentStep = stepNumber;
        updateProgress();
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
            
            if (testType === 'menopause') {
                showStep(6);
            } else {
                showStep(2);
            }
        });
    }
    
    document.querySelectorAll('input[name="season_dependency"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const description = document.getElementById('seasonDescription');
            if (description) {
                description.style.display = this.value === 'Да' ? 'block' : 'none';
            }
        });
    });
    
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
    
    if (data.test_type === 'regular') {
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
        
        if (data.menopause_frequency) totalScore += frequencyScores[data.menopause_frequency] * 2;
        if (data.menopause_intensity) totalScore += intensityScores[data.menopause_intensity] * 2;
        if (data.menopause_arousal_erected_want) totalScore += arousalScores[data.menopause_arousal_erected_want];
    }
    
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

// 🌟 ОКОНЧАТЕЛЬНАЯ ИНИЦИАЛИЗАЦИЯ
window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Страница загружена, инициализируем архив...');
    
    // Проверяем статус диагностики
    checkDiagnosticStatus();
    
    // Инициализируем тест
    initTest();
    
    // Обработчик для скрытой кнопки архива
    const archiveHiddenBtn = document.getElementById('archiveHiddenBtn');
    if (archiveHiddenBtn) {
        archiveHiddenBtn.addEventListener('click', function() {
            showArchiveSection();
        });
    }
    
    // Обработчик для ссылки архива
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
    
    // Обработчик для архива
    initArchiveHandlers();
});
