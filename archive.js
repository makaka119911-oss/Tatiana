// ===== ARCHIVE SYSTEM - TATIANA WEBSITE =====
// Полностью переработанная версия архива с улучшенным дизайном и обработкой ошибок

const ARCHIVE_PASSWORD = 'tatiana_archive_2024_LBg_makaka_9f3a7c2e8d1b5a4c6';
const API_BASE_URL = 'https://tatiana-server-production.up.railway.app';

// Глобальные переменные
let archiveData = [];
let currentSearch = '';
let currentFilter = '';

// Инициализация архива при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Инициализация системы архива...');
    initArchiveSystem();
});

function initArchiveSystem() {
    createArchiveButton();
    createArchiveModal();
    console.log('✅ Система архива готова');
}

// Создание кнопки архива
function createArchiveButton() {
    // Удаляем старую кнопку если есть
    const oldBtn = document.getElementById('archive-btn');
    if (oldBtn) oldBtn.remove();

    const archiveBtn = document.createElement('button');
    archiveBtn.id = 'archive-btn';
    archiveBtn.innerHTML = '📊';
    archiveBtn.title = 'Архив данных';
    archiveBtn.style.cssText = `
        position: fixed;
        bottom: 25px;
        left: 25px;
        width: 65px;
        height: 65px;
        border-radius: 50%;
        background: linear-gradient(135deg, #8B4352, #8B6B9E);
        border: 3px solid white;
        color: white;
        cursor: pointer;
        opacity: 0.9;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        z-index: 9999;
        font-size: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 25px rgba(139, 67, 82, 0.4);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    // Анимации при наведении
    archiveBtn.addEventListener('mouseenter', function() {
        this.style.opacity = '1';
        this.style.transform = 'scale(1.15) rotate(5deg)';
        this.style.boxShadow = '0 8px 30px rgba(139, 67, 82, 0.6)';
    });

    archiveBtn.addEventListener('mouseleave', function() {
        this.style.opacity = '0.9';
        this.style.transform = 'scale(1) rotate(0deg)';
        this.style.boxShadow = '0 6px 25px rgba(139, 67, 82, 0.4)';
    });

    archiveBtn.addEventListener('click', openArchiveModal);
    document.body.appendChild(archiveBtn);
}

// Создание модального окна архива
function createArchiveModal() {
    // Удаляем старый модал если есть
    const oldModal = document.getElementById('archive-modal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'archive-modal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 10000;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div class="archive-modal-content" style="
            background: linear-gradient(165deg, #FFF8F0 0%, #F5E6C8 50%, #F0E6FF 100%);
            border-radius: 24px;
            padding: 0;
            max-width: 95vw;
            width: 1300px;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 25px 80px rgba(0,0,0,0.4);
            border: 3px solid #8B4352;
            position: relative;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        ">
            <!-- Заголовок -->
            <div style="
                background: linear-gradient(135deg, #8B4352, #8B6B9E);
                padding: 1.5rem 2rem;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 3px solid rgba(255,255,255,0.2);
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 2rem;">📊</div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.6rem; font-weight: 700;">Архив данных</h2>
                        <p style="margin: 0; opacity: 0.9; font-size: 0.9rem;">Система управления регистрациями и результатами тестов</p>
                    </div>
                </div>
                <button id="archive-close-btn" style="
                    background: rgba(255,255,255,0.2);
                    border: 2px solid rgba(255,255,255,0.3);
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    width: 45px;
                    height: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                ">×</button>
            </div>

            <!-- Форма входа -->
            <div id="archive-login" style="padding: 3rem 2rem; text-align: center;">
                <div style="max-width: 500px; margin: 0 auto;">
                    <div style="font-size: 4rem; color: #8B4352; margin-bottom: 1.5rem;">🔒</div>
                    <h3 style="color: #8B4352; margin-bottom: 1rem; font-size: 1.8rem;">Защищенный доступ</h3>
                    <p style="color: #666; margin-bottom: 2.5rem; font-size: 1.1rem; line-height: 1.6;">
                        Для доступа к архиву данных требуется авторизация.<br>
                        Введите пароль безопасности для продолжения.
                    </p>
                    
                    <div style="position: relative; margin-bottom: 2rem;">
                        <input type="password" id="archive-password" placeholder="Введите пароль доступа" style="
                            width: 100%;
                            padding: 18px 20px;
                            border: 3px solid #E6E6FA;
                            border-radius: 12px;
                            font-size: 16px;
                            box-sizing: border-box;
                            text-align: center;
                            background: white;
                            transition: all 0.3s ease;
                            font-weight: 500;
                        ">
                        <div style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer;" onclick="togglePasswordVisibility()">
                            <span id="password-toggle" style="color: #8B6B9E; font-size: 1.2rem;">👁️</span>
                        </div>
                    </div>
                    
                    <button id="archive-login-btn" style="
                        width: 100%;
                        padding: 18px;
                        background: linear-gradient(135deg, #D46A6A, #8B6B9E);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        cursor: pointer;
                        font-weight: 700;
                        font-size: 1.1rem;
                        transition: all 0.3s ease;
                        box-shadow: 0 6px 20px rgba(139, 107, 158, 0.4);
                    ">🔓 Войти в архив</button>
                    
                    <div id="archive-error" style="
                        color: #e74c3c;
                        margin-top: 1.5rem;
                        display: none;
                        background: #ffebee;
                        padding: 1.2rem;
                        border-radius: 10px;
                        border-left: 5px solid #e74c3c;
                        font-weight: 500;
                    ">
                        ❌ Неверный пароль! Попробуйте снова.
                    </div>
                </div>
            </div>

            <!-- Содержимое архива -->
            <div id="archive-content" style="display: none; padding: 0;">
                <!-- Панель управления -->
                <div style="background: white; padding: 1.5rem 2rem; border-bottom: 2px solid #f0f0f0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
                        <div style="flex: 1; min-width: 300px;">
                            <h3 style="color: #8B4352; margin: 0 0 0.5rem 0; font-size: 1.4rem;">
                                📈 Панель управления данными
                            </h3>
                            <p style="color: #666; margin: 0; font-size: 0.95rem;" id="archive-stats">
                                Загрузка статистики...
                            </p>
                        </div>
                        
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <button id="refresh-data" style="
                                padding: 12px 20px;
                                background: #3498db;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                transition: all 0.3s ease;
                            ">
                                🔄 Обновить
                            </button>
                            <button id="export-csv" style="
                                padding: 12px 20px;
                                background: #27ae60;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                transition: all 0.3s ease;
                            ">
                                📥 Экспорт CSV
                            </button>
                            <button id="archive-logout-btn" style="
                                padding: 12px 24px;
                                background: #e74c3c;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                transition: all 0.3s ease;
                            ">
                                🚪 Выйти
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Панель поиска и фильтров -->
                <div style="background: #f8f9fa; padding: 1.5rem 2rem; border-bottom: 1px solid #e9ecef;">
                    <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 350px;">
                            <label style="display: block; color: #8B4352; font-weight: 600; margin-bottom: 0.8rem; font-size: 1rem;">
                                🔍 Поиск по имени или фамилии
                            </label>
                            <input type="text" id="archive-search" placeholder="Введите имя для поиска..." style="
                                width: 100%;
                                padding: 14px 16px;
                                border: 2px solid #ddd;
                                border-radius: 10px;
                                font-size: 15px;
                                box-sizing: border-box;
                                transition: all 0.3s ease;
                                background: white;
                            ">
                        </div>
                        
                        <div style="min-width: 280px;">
                            <label style="display: block; color: #8B4352; font-weight: 600; margin-bottom: 0.8rem; font-size: 1rem;">
                                ⚡ Фильтр по уровню либидо
                            </label>
                            <select id="archive-filter" style="
                                width: 100%;
                                padding: 14px 16px;
                                border: 2px solid #ddd;
                                border-radius: 10px;
                                font-size: 15px;
                                background: white;
                                cursor: pointer;
                            ">
                                <option value="">Все уровни</option>
                                <option value="Low">🔴 Низкое либидо</option>
                                <option value="Medium">🟡 Среднее либидо</option>
                                <option value="High">🟢 Высокое либидо</option>
                                <option value="Very high">🟣 Очень высокое</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Индикатор загрузки -->
                <div id="archive-loading" style="display: none; text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 4rem; color: #8B4352; margin-bottom: 1.5rem;">
                        <div class="loading-spinner">⏳</div>
                    </div>
                    <p style="color: #666; font-size: 1.2rem; margin-bottom: 0.5rem;">Загрузка данных архива</p>
                    <p style="color: #999; font-size: 0.9rem;">Пожалуйста, подождите...</p>
                </div>

                <!-- Контейнер таблицы -->
                <div id="archive-table-container" style="padding: 0;">
                    <div style="overflow-x: auto; max-height: 50vh;">
                        <table id="archive-table" style="
                            width: 100%;
                            border-collapse: collapse;
                            min-width: 1200px;
                            background: white;
                        ">
                            <thead style="position: sticky; top: 0; z-index: 10;">
                                <tr style="background: linear-gradient(135deg, #8B4352, #8B6B9E);">
                                    <th style="
                                        padding: 18px 16px;
                                        text-align: left;
                                        color: white;
                                        font-weight: 700;
                                        font-size: 0.95rem;
                                        border-right: 1px solid rgba(255,255,255,0.15);
                                        min-width: 200px;
                                    ">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span>👤</span>
                                            <span>ФИО</span>
                                        </div>
                                    </th>
                                    <th style="
                                        padding: 18px 12px;
                                        text-align: center;
                                        color: white;
                                        font-weight: 700;
                                        font-size: 0.95rem;
                                        border-right: 1px solid rgba(255,255,255,0.15);
                                        min-width: 80px;
                                    ">Возраст</th>
                                    <th style="
                                        padding: 18px 16px;
                                        text-align: left;
                                        color: white;
                                        font-weight: 700;
                                        font-size: 0.95rem;
                                        border-right: 1px solid rgba(255,255,255,0.15);
                                        min-width: 150px;
                                    ">📞 Телефон</th>
                                    <th style="
                                        padding: 18px 16px;
                                        text-align: left;
                                        color: white;
                                        font-weight: 700;
                                        font-size: 0.95rem;
                                        border-right: 1px solid rgba(255,255,255,0.15);
                                        min-width: 150px;
                                    ">✈️ Telegram</th>
                                    <th style="
                                        padding: 18px 12px;
                                        text-align: center;
                                        color: white;
                                        font-weight: 700;
                                        font-size: 0.95rem;
                                        border-right: 1px solid rgba(255,255,255,0.15);
                                        min-width: 180px;
                                    ">⚡ Уровень либидо</th>
                                    <th style="
                                        padding: 18px 12px;
                                        text-align: center;
                                        color: white;
                                        font-weight: 700;
                                        font-size: 0.95rem;
                                        border-right: 1px solid rgba(255,255,255,0.15);
                                        min-width: 100px;
                                    ">⭐ Баллы</th>
                                    <th style="
                                        padding: 18px 12px;
                                        text-align: center;
                                        color: white;
                                        font-weight: 700;
                                        font-size: 0.95rem;
                                        min-width: 120px;
                                    ">📅 Дата</th>
                                </tr>
                            </thead>
                            <tbody id="archive-table-body">
                                <tr>
                                    <td colspan="7" style="
                                        padding: 4rem 2rem;
                                        text-align: center;
                                        color: #999;
                                        font-style: italic;
                                        font-size: 1.1rem;
                                    ">
                                        Данные не загружены. Войдите в систему для просмотра архива.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Пагинация и информация -->
                <div style="
                    background: #f8f9fa;
                    padding: 1.2rem 2rem;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                ">
                    <div style="color: #666; font-size: 0.9rem;" id="archive-info">
                        Загрузка информации...
                    </div>
                    <div style="display: flex; gap: 0.5rem;" id="archive-pagination">
                        <!-- Пагинация будет генерироваться динамически -->
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    attachEventHandlers();
    addModalAnimations();
}

// Прикрепление обработчиков событий
function attachEventHandlers() {
    // Кнопка входа
    document.getElementById('archive-login-btn').addEventListener('click', handleArchiveLogin);
    
    // Кнопка выхода
    document.getElementById('archive-logout-btn').addEventListener('click', handleArchiveLogout);
    
    // Кнопка закрытия
    document.getElementById('archive-close-btn').addEventListener('click', closeArchiveModal);
    
    // Поиск и фильтрация
    document.getElementById('archive-search').addEventListener('input', function(e) {
        currentSearch = e.target.value.toLowerCase();
        filterArchiveTable();
    });
    
    document.getElementById('archive-filter').addEventListener('change', function(e) {
        currentFilter = e.target.value;
        filterArchiveTable();
    });
    
    // Кнопки управления
    document.getElementById('refresh-data').addEventListener('click', loadArchiveData);
    document.getElementById('export-csv').addEventListener('click', exportToCSV);
    
    // Enter в поле пароля
    document.getElementById('archive-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleArchiveLogin();
    });
    
    // Закрытие по клику на фон
    document.getElementById('archive-modal').addEventListener('click', function(e) {
        if (e.target === this) closeArchiveModal();
    });
}

// Добавление анимаций
function addModalAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideInUp {
            from { 
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to { 
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .archive-modal-content {
            animation: slideInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .loading-spinner {
            animation: spin 1.5s linear infinite;
        }
        
        #archive-btn {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .archive-row:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Переключение видимости пароля
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('archive-password');
    const toggleIcon = document.getElementById('password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '👁️‍🗨️';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️';
    }
}

// Открытие модального окна архива
function openArchiveModal() {
    const modal = document.getElementById('archive-modal');
    modal.style.display = 'flex';
    document.getElementById('archive-password').focus();
    
    // Сброс состояния
    document.getElementById('archive-password').value = '';
    document.getElementById('archive-error').style.display = 'none';
    document.getElementById('archive-login').style.display = 'block';
    document.getElementById('archive-content').style.display = 'none';
}

// Закрытие модального окна архива
function closeArchiveModal() {
    const modal = document.getElementById('archive-modal');
    modal.style.display = 'none';
    
    // Очистка данных
    document.getElementById('archive-password').value = '';
    document.getElementById('archive-error').style.display = 'none';
    currentSearch = '';
    currentFilter = '';
    document.getElementById('archive-search').value = '';
    document.getElementById('archive-filter').value = '';
}

// Обработка входа в архив
function handleArchiveLogin() {
    const password = document.getElementById('archive-password').value;
    const errorElement = document.getElementById('archive-error');

    if (password === ARCHIVE_PASSWORD) {
        errorElement.style.display = 'none';
        document.getElementById('archive-login').style.display = 'none';
        document.getElementById('archive-content').style.display = 'block';
        loadArchiveData();
    } else {
        errorElement.style.display = 'block';
        document.getElementById('archive-password').value = '';
        document.getElementById('archive-password').focus();
        
        // Анимация ошибки
        errorElement.style.animation = 'none';
        setTimeout(() => {
            errorElement.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
    }
}

// Обработка выхода из архива
function handleArchiveLogout() {
    closeArchiveModal();
}

// Загрузка данных архива
async function loadArchiveData() {
    const loadingElement = document.getElementById('archive-loading');
    const tableBody = document.getElementById('archive-table-body');
    
    // Показываем загрузку
    loadingElement.style.display = 'block';
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" style="padding: 3rem; text-align: center; color: #999;">
                Загрузка данных...
            </td>
        </tr>
    `;

    try {
        console.log('🔄 Начало загрузки архива...');
        
        const response = await fetch(`${API_BASE_URL}/api/archive`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ARCHIVE_PASSWORD}`,
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        });

        console.log('📨 Статус ответа:', response.status);
        
        if (response.status === 401) {
            throw new Error('Ошибка авторизации: неверный токен доступа');
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ошибка ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Данные получены:', data);
        
        if (data.success && data.records) {
            archiveData = data.records;
            populateArchiveTable(archiveData);
            updateArchiveStats();
            showNotification('✅ Данные архива успешно загружены', 'success');
        } else {
            throw new Error(data.error || 'Неверный формат ответа от сервера');
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки архива:', error);
        
        let errorMessage = 'Не удалось загрузить данные: ';
        if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Проблема с подключением к серверу. Проверьте интернет-соединение.';
        } else if (error.message.includes('401')) {
            errorMessage += 'Ошибка авторизации. Проверьте токен доступа.';
        } else {
            errorMessage += error.message;
        }
        
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 3rem; text-align: center; color: #e74c3c;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                    <div style="font-weight: 600; margin-bottom: 1rem;">${errorMessage}</div>
                    <small>Проверьте консоль браузера для подробной информации</small>
                </td>
            </tr>
        `;
        
        showNotification('❌ Ошибка загрузки данных архива', 'error');
    } finally {
        loadingElement.style.display = 'none';
    }
}

// Заполнение таблицы данными
function populateArchiveTable(records) {
    const tbody = document.getElementById('archive-table-body');

    if (!records || records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 4rem 2rem; text-align: center; color: #999;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📭</div>
                    <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">Архив пуст</div>
                    <div style="font-size: 0.9rem; color: #666;">Нет данных для отображения</div>
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

    updateArchiveInfo(records.length);
}

// Получение стиля для уровня либидо
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

// Получение иконки для уровня либидо
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

// Обновление статистики архива
function updateArchiveStats() {
    if (!archiveData || archiveData.length === 0) {
        document.getElementById('archive-stats').textContent = 'Нет данных для анализа';
        return;
    }
    
    const total = archiveData.length;
    const levels = {
        low: archiveData.filter(r => r.level && r.level.includes('Low')).length,
        medium: archiveData.filter(r => r.level && r.level.includes('Medium')).length,
        high: archiveData.filter(r => r.level && r.level.includes('High') && !r.level.includes('Very')).length,
        veryHigh: archiveData.filter(r => r.level && r.level.includes('Very')).length
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

// Обновление информации о данных
function updateArchiveInfo(totalCount) {
    const filteredCount = currentSearch || currentFilter ? 
        archiveData.filter(record => filterRecord(record)).length : 
        totalCount;
    
    let infoText = `Показано: <strong>${filteredCount}</strong> из <strong>${totalCount}</strong> записей`;
    
    if (currentSearch) {
        infoText += ` | Поиск: "${currentSearch}"`;
    }
    
    if (currentFilter) {
        infoText += ` | Фильтр: ${document.getElementById('archive-filter').options[document.getElementById('archive-filter').selectedIndex].text}`;
    }
    
    document.getElementById('archive-info').innerHTML = infoText;
}

// Фильтрация таблицы архива
function filterArchiveTable() {
    if (!archiveData || archiveData.length === 0) return;
    
    const filteredData = archiveData.filter(record => filterRecord(record));
    populateArchiveTable(filteredData);
}

// Проверка записи на соответствие фильтрам
function filterRecord(record) {
    let matchesSearch = true;
    let matchesFilter = true;
    
    if (currentSearch) {
        const searchableText = `${record.fio || ''} ${record.phone || ''} ${record.telegram || ''}`.toLowerCase();
        matchesSearch = searchableText.includes(currentSearch);
    }
    
    if (currentFilter) {
        matchesFilter = record.level && record.level.includes(currentFilter);
    }
    
    return matchesSearch && matchesFilter;
}

// Экспорт данных в CSV
function exportToCSV() {
    if (!archiveData || archiveData.length === 0) {
        showNotification('❌ Нет данных для экспорта', 'error');
        return;
    }
    
    try {
        const headers = ['ФИО', 'Возраст', 'Телефон', 'Telegram', 'Уровень либидо', 'Баллы', 'Дата регистрации'];
        const csvData = archiveData.map(record => [
            record.fio || '',
            record.age || '',
            record.phone || '',
            record.telegram || '',
            record.level || '',
            record.score || '',
            record.date ? new Date(record.date).toLocaleDateString('ru-RU') : ''
        ]);
        
        let csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + headers.join(';') + '\n';
        csvContent += csvData.map(row => 
            row.map(field => `"${field}"`).join(';')
        ).join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `tatiana_archive_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('✅ Данные экспортированы в CSV', 'success');
    } catch (error) {
        console.error('Ошибка экспорта:', error);
        showNotification('❌ Ошибка при экспорте данных', 'error');
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Удаляем старые уведомления
    const oldNotifications = document.querySelectorAll('.archive-notification');
    oldNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `archive-notification archive-notification-${type}`;
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 12px;
        z-index: 10001;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 6px 25px rgba(0,0,0,0.15);
        max-width: 400px;
        color: white;
        font-weight: 500;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 10px;
        backdrop-filter: blur(10px);
    `;
    
    const backgrounds = {
        success: 'linear-gradient(135deg, #27ae60, #2ecc71)',
        error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        info: 'linear-gradient(135deg, #3498db, #2980b9)'
    };
    
    notification.style.background = backgrounds[type] || backgrounds.info;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `${icons[type]} ${message}`;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 4000);
}

// Добавление CSS анимаций для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        75% { transform: translateX(8px); }
    }
`;
document.head.appendChild(notificationStyles);

// Экспорт функций для глобального использования
window.ArchiveSystem = {
    openArchive: openArchiveModal,
    closeArchive: closeArchiveModal,
    loadData: loadArchiveData,
    refreshData: loadArchiveData
};

console.log('🎯 Модуль архива полностью загружен и готов к работе!');
