// Конфигурация Telegram
const TELEGRAM_BOT_TOKEN = '8402206062:AAEJim1GkriKqY_o1mOo0YWSWQDdw5Qy2h0';
const TELEGRAM_CHAT_ID = '-1002313355102';
const ARCHIVE_PASSWORD = 'admin123'; // Пароль для архива

// Глобальные переменные
let currentStep = 1;
let totalSteps = 6;
let testData = {};
let registrationData = {};
let archiveData = [];
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт загружен');

    // Проверяем, пройдена ли диагностика
    checkDiagnosticStatus();

    // Инициализация
    initEventListeners();
    initTestSteps();
    initArchiveLogin();
    initArchiveSearch();
});

function checkDiagnosticStatus() {
    const diagnosticCompleted = localStorage.getItem('diagnosticCompleted') === 'true';
    if (diagnosticCompleted) {
        unlockAllSections();
    }
}

function unlockAllSections() {
    // Скрываем замки и показываем контент для всех секций
    const sections = ['about', 'power', 'services', 'process', 'awakening', 'contacts'];
    
    sections.forEach(section => {
        const lock = document.getElementById(section + 'Lock');
        const content = document.getElementById(section + 'Content');
        
        if (lock) lock.style.display = 'none';
        if (content) content.style.display = 'block';
    });
}

function initEventListeners() {
    // Форма регистрации
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistrationSubmit);
    }

    // Форма теста
    const testForm = document.getElementById('libidoTestForm');
    if (testForm) {
        testForm.addEventListener('submit', handleTestSubmit);
    }

    // Форма консультации
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        consultationForm.addEventListener('submit', handleConsultationSubmit);
    }

    // Кнопка "Назад к тесту"
    const backToTestBtn = document.getElementById('backToTest');
    if (backToTestBtn) {
        backToTestBtn.addEventListener('click', function() {
            showTestSection();
        });
    }
// В функции initEventListeners добавьте:
document.querySelectorAll('input[name="season_dependency"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const description = document.getElementById('seasonDescription');
        if (description) {
            description.style.display = this.value === 'Да' ? 'block' : 'none';
        }
    });
});
    // Сезонная зависимость
    document.querySelectorAll('input[name="season_dependency"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const description = document.getElementById('seasonDescription');
            description.style.display = this.value === 'Да' ? 'block' : 'none';
        });
    });

    // Навигационные ссылки
    document.querySelectorAll('.registration-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showRegistrationSection();
        });
    });

    document.querySelectorAll('.consultation-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showContactsSection();
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

    // Ссылка на архив
    document.querySelectorAll('.archive-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showArchiveSection();
        });
    });

    // Мобильное меню
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });
}

// ===== ARCHIVE FUNCTIONALITY =====

// Функция для сохранения данных в localStorage
function saveToArchive(userData, testResult) {
    const archiveEntry = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        userData: userData,
        testResult: testResult,
        completed: true
    };
    
    let existingData = JSON.parse(localStorage.getItem('libidoTestArchive') || '[]');
    existingData.push(archiveEntry);
    localStorage.setItem('libidoTestArchive', JSON.stringify(existingData));
    
    console.log('✅ Данные сохранены в архив, включая фото');
}

// Функция для загрузки данных из архива
function loadArchiveData() {
    const data = JSON.parse(localStorage.getItem('libidoTestArchive') || '[]');
    archiveData = data;
    return data;
}

// Функция для поиска в архиве
function searchArchive(query, levelFilter, testTypeFilter) {
    let filteredData = loadArchiveData();
    
    // Поиск по тексту
    if (query) {
        const searchTerm = query.toLowerCase();
        filteredData = filteredData.filter(item => 
            item.userData.firstName.toLowerCase().includes(searchTerm) ||
            item.userData.lastName.toLowerCase().includes(searchTerm) ||
            item.testResult.level.toLowerCase().includes(searchTerm) ||
            item.userData.telegram.toLowerCase().includes(searchTerm)
        );
    }
    
    // Фильтр по уровню либидо
    if (levelFilter) {
        filteredData = filteredData.filter(item => 
            item.testResult.level.includes(levelFilter)
        );
    }
    
    // Фильтр по типу теста
    if (testTypeFilter) {
        filteredData = filteredData.filter(item => 
            item.testResult.testType === testTypeFilter
        );
    }
    
    return filteredData;
}

// Функция для отображения данных в таблице
function displayArchiveData(data, page = 1) {
    const tableBody = document.getElementById('resultsTableBody');
    const pagination = document.getElementById('pagination');
    
    if (!tableBody) return;
    
    // Очищаем таблицу
    tableBody.innerHTML = '';
    
    // Рассчитываем пагинацию
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    // Заполняем таблицу
   pageData.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <div style="display: flex; align-items: center; gap: 10px;">
                ${item.userData.photo ? 
                    `<img src="${item.userData.photo}" alt="Фото" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` : 
                    '<div style="width: 40px; height: 40px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center;"><i class="fas fa-user" style="color: #ccc;"></i></div>'
                }
                <span>${item.userData.lastName} ${item.userData.firstName}</span>
            </div>
        </td>
        <td>${item.userData.age}</td>
        <td>${item.userData.phone}</td>
        <td>${item.userData.telegram}</td>
        <td>${item.testResult.testType === 'regular' ? 'Обычный' : 'Менопауза'}</td>
        <td>
            <span class="level-badge ${getLevelClass(item.testResult.level)}">
                ${item.testResult.level}
            </span>
        </td>
        <td>${item.testResult.score}</td>
        <td>${new Date(item.timestamp).toLocaleDateString('ru-RU')}</td>
        <td>
            <button class="btn-view-details" onclick="viewUserDetails('${item.id}')">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn-delete" onclick="deleteUserData('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tableBody.appendChild(row);
});
    
    // Если данных нет
    if (pageData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>Нет данных для отображения</p>
                </td>
            </tr>
        `;
    }
    
    // Обновляем пагинацию
    updatePagination(totalPages, page);
    
    // Обновляем статистику
    updateArchiveStats(data);
}

// Функция для получения класса уровня либидо
function getLevelClass(level) {
    if (level.includes('Низкое')) return 'level-badge-low';
    if (level.includes('Среднее')) return 'level-badge-medium';
    if (level.includes('Высокое')) return 'level-badge-high';
    if (level.includes('Очень высокое')) return 'level-badge-very-high';
    return '';
}

// Функция для обновления пагинации
function updatePagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Кнопка "Назад"
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.onclick = () => {
            displayArchiveData(archiveData, currentPage - 1);
        };
        pagination.appendChild(prevBtn);
    }
    
    // Номера страниц
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            displayArchiveData(archiveData, i);
        };
        pagination.appendChild(pageBtn);
    }
    
    // Кнопка "Вперед"
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.onclick = () => {
            displayArchiveData(archiveData, currentPage + 1);
        };
        pagination.appendChild(nextBtn);
    }
}

// Функция для обновления статистики
function updateArchiveStats(data) {
    const totalUsers = document.getElementById('totalUsers');
    const avgScore = document.getElementById('avgScore');
    const completionRate = document.getElementById('completionRate');
    
    if (!totalUsers || !avgScore || !completionRate) return;
    
    totalUsers.textContent = data.length;
    
    // Средний балл
    if (data.length > 0) {
        const totalScore = data.reduce((sum, item) => sum + item.testResult.score, 0);
        avgScore.textContent = (totalScore / data.length).toFixed(1);
    } else {
        avgScore.textContent = '0';
    }
    
    // Процент завершения (все данные уже завершены, так как попали в архив)
    completionRate.textContent = '100%';
}

// Функция для просмотра деталей пользователя
function viewUserDetails(userId) {
    const userData = archiveData.find(item => item.id === userId);
    if (!userData) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Детальная информация</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="user-details">
                    <div class="detail-section" style="text-align: center;">
                        ${userData.userData.photo ? 
                            `<img src="${userData.userData.photo}" alt="Фото профиля" style="max-width: 200px; border-radius: 10px; margin-bottom: 1rem;">` : 
                            '<div style="width: 200px; height: 200px; background: #f0f0f0; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;"><i class="fas fa-user" style="font-size: 3rem; color: #ccc;"></i></div>'
                        }
                        <h4>${userData.userData.lastName} ${userData.userData.firstName}</h4>
                        <p>Возраст: ${userData.userData.age} лет</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Контактная информация</h4>
                        <p><strong>Телефон:</strong> ${userData.userData.phone}</p>
                        <p><strong>Telegram:</strong> ${userData.userData.telegram}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Результаты теста</h4>
                        <p><strong>Тип теста:</strong> ${userData.testResult.testType === 'regular' ? 'Обычный' : 'Менопауза'}</p>
                        <p><strong>Уровень либидо:</strong> ${userData.testResult.level}</p>
                        <p><strong>Баллы:</strong> ${userData.testResult.score}</p>
                        <p><strong>Дата прохождения:</strong> ${new Date(userData.timestamp).toLocaleString('ru-RU')}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Описание результата</h4>
                        <p>${userData.testResult.description}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">
                    Закрыть
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Функция для удаления данных пользователя
function deleteUserData(userId) {
    if (!confirm('Вы уверены, что хотите удалить данные этого пользователя?')) {
        return;
    }
    
    archiveData = archiveData.filter(item => item.id !== userId);
    localStorage.setItem('libidoTestArchive', JSON.stringify(archiveData));
    
    // Перезагружаем таблицу
    displayArchiveData(archiveData, currentPage);
    showSuccessMessage('✅ Данные пользователя удалены');
}

// Функция для экспорта в Excel
function exportToExcel() {
    const data = loadArchiveData();
    
    if (data.length === 0) {
        showErrorMessage('❌ Нет данных для экспорта');
        return;
    }
    
    // Создаем CSV содержимое
    let csv = 'Фамилия,Имя,Возраст,Телефон,Telegram,Тип теста,Уровень либидо,Баллы,Дата\n';
    
    data.forEach(item => {
        csv += `"${item.userData.lastName}","${item.userData.firstName}","${item.userData.age}","${item.userData.phone}","${item.userData.telegram}","${item.testResult.testType === 'regular' ? 'Обычный' : 'Менопауза'}","${item.testResult.level}","${item.testResult.score}","${new Date(item.timestamp).toLocaleDateString('ru-RU')}"\n`;
    });
    
    // Создаем и скачиваем файл
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `архив_либидо_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccessMessage('✅ Данные экспортированы в CSV файл');
}

// Обработчик формы входа в архив
function initArchiveLogin() {
    const loginForm = document.getElementById('archiveLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Важно: предотвращаем перезагрузку страницы
            
            const password = document.getElementById('archivePassword').value;
            
            if (password === ARCHIVE_PASSWORD) {
                document.getElementById('archiveContent').style.display = 'block';
                document.getElementById('archivePasswordError').style.display = 'none';
                
                // Загружаем и отображаем данные
                const data = loadArchiveData();
                archiveData = data;
                displayArchiveData(data, 1);
                
                showSuccessMessage('✅ Доступ к архиву разрешен');
            } else {
                document.getElementById('archivePasswordError').style.display = 'block';
                showErrorMessage('❌ Неверный пароль');
            }
        });
    }
}

// Инициализация поиска и фильтров
function initArchiveSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const levelFilter = document.getElementById('levelFilter');
    const testTypeFilter = document.getElementById('testTypeFilter');
    const exportBtn = document.getElementById('exportBtn');
    
    function performSearch() {
        const query = searchInput.value;
        const level = levelFilter.value;
        const testType = testTypeFilter.value;
        
        const filteredData = searchArchive(query, level, testType);
        archiveData = filteredData;
        displayArchiveData(filteredData, 1);
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    if (levelFilter) {
        levelFilter.addEventListener('change', performSearch);
    }
    
    if (testTypeFilter) {
        testTypeFilter.addEventListener('change', performSearch);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToExcel);
    }
}

// Функция для показа секции архива
function showArchiveSection() {
    hideAllSections();
    document.getElementById('archive').classList.remove('section-hidden');
    
    // Сбрасываем форму при каждом входе в архив
    const loginForm = document.getElementById('archiveLoginForm');
    if (loginForm) {
        loginForm.reset();
    }
    document.getElementById('archiveContent').style.display = 'none';
    document.getElementById('archivePasswordError').style.display = 'none';
    
    scrollToTop();
}

// Остальные функции (initTestSteps, validateStep, nextStep, prevStep и т.д.) остаются без изменений
// ... (добавьте сюда все остальные функции из предыдущего кода)
    // Кнопка "Назад к тесту"
    const backToTestBtn = document.getElementById('backToTest');
    if (backToTestBtn) {
        backToTestBtn.addEventListener('click', function() {
            showTestSection();
        });
    }

    // Сезонная зависимость
    document.querySelectorAll('input[name="season_dependency"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const description = document.getElementById('seasonDescription');
            description.style.display = this.value === 'Да' ? 'block' : 'none';
        });
    });

    // Навигационные ссылки
    document.querySelectorAll('.registration-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showRegistrationSection();
        });
    });

    document.querySelectorAll('.consultation-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showContactsSection();
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

    // Мобильное меню
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });
}

function initTestSteps() {
    // Добавляем обработчики для опций
    document.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                
                // Добавляем визуальное выделение
                this.parentElement.querySelectorAll('.option-item').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
            }
        });
    });
}

// Функция проверки валидности шага
function validateStep(step) {
    const stepElement = document.getElementById('step' + step);
    if (!stepElement) return true;

    const requiredInputs = stepElement.querySelectorAll('[required]');
    let isValid = true;

    // Сбрасываем предыдущие ошибки
    stepElement.querySelectorAll('.error-message').forEach(error => {
        error.style.display = 'none';
    });
    stepElement.querySelectorAll('.form-control.error').forEach(input => {
        input.classList.remove('error');
    });

    // Убираем выделение ошибок с вопросов
    stepElement.querySelectorAll('.question-block').forEach(block => {
        block.classList.remove('error-highlight');
    });

    // Проверяем каждое обязательное поле
    requiredInputs.forEach(input => {
        if (input.type === 'radio') {
            // Для радио-кнопок проверяем, что хотя бы одна в группе выбрана
            const radioGroup = stepElement.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            
            if (!isChecked) {
                isValid = false;
                // Показываем ошибку для этой группы
                const errorElement = document.getElementById(input.name + 'Error');
                if (errorElement) {
                    errorElement.style.display = 'block';
                }
                
                // Выделяем вопрос красным
                const questionBlock = input.closest('.question-block');
                if (questionBlock) {
                    questionBlock.classList.add('error-highlight');
                }
            }
        } else {
            // Для других типов полей проверяем значение
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                const errorElement = document.getElementById(input.name + 'Error');
                if (errorElement) {
                    errorElement.style.display = 'block';
                }
            }
        }
    });

    return isValid;
}

let currentTestType = '';

function nextStep(step) {
    if (!validateStep(currentStep)) {
        showNotification('Пожалуйста, ответьте на все обязательные вопросы этого шага', 'error');
        return;
    }

    if (step === 2) {
        const testType = document.querySelector('input[name="test_type"]:checked');
        if (!testType) {
            showNotification('Пожалуйста, выберите тип теста', 'error');
            return;
        }
        
        currentTestType = testType.value;
        totalSteps = currentTestType === 'regular' ? 6 : 2;
    }
    
    // Hide all steps
    document.querySelectorAll('.test-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // Show appropriate step based on test type
    let stepToShow;
    if (step === 1) {
        stepToShow = 'step1';
    } else if (step === 6) {
        stepToShow = 'step6';
    } else {
        stepToShow = `step${step}_${currentTestType}`;
    }
    
    document.getElementById(stepToShow).classList.add('active');
    currentStep = step;
    
    updateProgress();
    scrollToTop();
}

function prevStep(step) {
    // Hide all steps
    document.querySelectorAll('.test-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // Show appropriate step based on test type
    let stepToShow;
    if (step === 1) {
        stepToShow = 'step1';
    } else if (step === 6) {
        stepToShow = 'step6';
    } else {
        stepToShow = `step${step}_${currentTestType}`;
    }
    
    document.getElementById(stepToShow).classList.add('active');
    currentStep = step;
    
    updateProgress();
    scrollToTop();
}

function prevStep(step) {
    document.querySelector('.test-step.active').classList.remove('active');
    document.getElementById('step' + step).classList.add('active');
    currentStep = step;
    
    updateProgress();
    
    // Прокрутка к верху страницы
    scrollToTop();
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('testProgress').style.width = progress + '%';
    document.getElementById('progressText').textContent = `Шаг ${currentStep} из ${totalSteps}`;
}

// Добавьте эти функции после функции updateProgress()
// Замените существующую функцию generateTestSteps на эту:
function generateTestSteps(testType) {
    const stepsContainer = document.getElementById('libidoTestForm');
    
    // Удаляем предыдущие сгенерированные шаги (кроме первого и последнего)
    document.querySelectorAll('.test-step:not(#step1):not(#step6)').forEach(step => {
        step.remove();
    });
    
    if (testType === 'regular') {
        // Генерируем 4 периода для обычного теста
        const periods = [
            { id: 1, name: 'От конца месячных до овуляции' },
            { id: 2, name: 'В период овуляции' },
            { id: 3, name: 'От конца овуляции до начала месячных' },
            { id: 4, name: 'В период месячных' }
        ];
        
        periods.forEach((period, index) => {
            const stepNumber = index + 2;
            const stepHTML = `
                <div class="test-step" id="step${stepNumber}">
                    <div class="step-header">
                        <h4>Период: ${period.name}</h4>
                        <p>Ответьте на вопросы для этого периода цикла</p>
                    </div>
                    
                    ${generatePeriodQuestions(period.id, period.name)}
                    
                    <div class="test-navigation">
                        <button type="button" class="btn btn-outline" onclick="prevStep(${stepNumber - 1})">
                            <i class="fas fa-arrow-left"></i> Назад
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="nextStep(${stepNumber + 1})">
                            Далее <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Вставляем перед последним шагом (сезонным вопросом)
            const lastStep = document.getElementById('step6');
            lastStep.insertAdjacentHTML('beforebegin', stepHTML);
        });
        
        totalSteps = 6;
    } else {
        // Для менопаузы - один шаг с вопросами
        const stepHTML = `
            <div class="test-step" id="step2">
                <div class="step-header">
                    <h4>Вопросы для периода менопаузы</h4>
                    <p>Ответьте на вопросы о вашем текущем состоянии</p>
                </div>
                
                ${generateMenopauseQuestions()}
                
                <div class="test-navigation">
                    <button type="button" class="btn btn-outline" onclick="prevStep(1)">
                        <i class="fas fa-arrow-left"></i> Назад
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="nextStep(6)">
                        Далее <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        const lastStep = document.getElementById('step6');
        lastStep.insertAdjacentHTML('beforebegin', stepHTML);
        totalSteps = 2;
    }
    
    // Переинициализируем обработчики
    initTestSteps();
}

function generatePeriodQuestions(periodId, periodName) {
    return `
        <div class="question-block">
            <div class="question-text">Как часто хочется секса в период "${periodName}"?</div>
            <div class="options-grid">
                ${generateOptions(`period${periodId}_frequency`, [
                    'Вообще не хочется',
                    'Хочется 1 раза в неделю',
                    'Хочется 1 раз в 3 дня',
                    'Хочется через день',
                    'Хочется каждый день',
                    'Хочется каждый день по много раз'
                ])}
            </div>
        </div>
        
        <div class="question-block">
            <div class="question-text">Сила желания в те дни, когда хочется секса?</div>
            <div class="options-grid">
                ${generateOptions(`period${periodId}_strength`, [
                    'Легкое желание',
                    'Среднее желание',
                    'Сильное желание',
                    'Очень сильное желание',
                    'Максимально сильное желание(на столько,что почти невозможно терпеть)'
                ])}
            </div>
        </div>
        
        <div class="question-block">
            <div class="question-text">Возбуждает ли Вас вид эрегированного полового члена в дни, когда хочется секса?</div>
            <div class="options-grid">
                ${generateOptions(`period${periodId}_erected_want`, [
                    'Вообще не возбуждает',
                    'Немного возбуждает',
                    'Средне возбуждает',
                    'Сильно возбуждает',
                    'Очень сильно возбуждает'
                ])}
            </div>
        </div>
        
        <div class="question-block">
            <div class="question-text">Возбуждает ли Вас вид эрегированного полового члена в дни, когда НЕ хочется секса?</div>
            <div class="options-grid">
                ${generateOptions(`period${periodId}_erected_not_want`, [
                    'Вообще не возбуждает',
                    'Немного возбуждает',
                    'Средне возбуждает',
                    'Сильно возбуждает',
                    'Очень сильно возбуждает'
                ])}
            </div>
        </div>
        
        <div class="question-block">
            <div class="question-text">Возбуждает ли Вас вид НЕэрегированного полового члена в дни, когда хочется секса?</div>
            <div class="options-grid">
                ${generateOptions(`period${periodId}_non_erected_want`, [
                    'Вообще не возбуждает',
                    'Немного возбуждает',
                    'Средне возбуждает',
                    'Сильно возбуждает',
                    'Очень сильно возбуждает'
                ])}
            </div>
        </div>
        
        <div class="question-block">
            <div class="question-text">Возбуждает ли Вас вид НЕэрегированного полового члена в дни, когда НЕ хочется секса?</div>
            <div class="options-grid">
                ${generateOptions(`period${periodId}_non_erected_not_want`, [
                    'Вообще не возбуждает',
                    'Немного возбуждает',
                    'Средне возбуждает',
                    'Сильно возбуждает',
                    'Очень сильно возбуждает'
                ])}
            </div>
        </div>
    `;
}

function generateMenopauseQuestions() {
    return `
        <div class="question-block">
            <div class="question-text">Как часто хочется секса в текущий период?</div>
            <div class="options-grid">
                ${generateOptions('menopause_frequency', [
                    'Вообще не хочется',
                    'Хочется 1 раза в неделю',
                    'Хочется 1 раз в 3 дня',
                    'Хочется через день',
                    'Хочется каждый день',
                    'Хочется каждый день по много раз'
                ])}
            </div>
        </div>
        
        <div class="question-block">
            <div class="question-text">Сила желания в те дни, когда хочется секса?</div>
            <div class="options-grid">
                ${generateOptions('menopause_strength', [
                    'Легкое желание',
                    'Среднее желание',
                    'Сильное желание',
                    'Очень сильное желание',
                    'Максимально сильное желание(на столько,что почти невозможно терпеть)'
                ])}
            </div>
        </div>
        
        <div class="question-block">
            <div class="question-text">Возбуждает ли Вас вид эрегированного полового члена в дни, когда хочется секса?</div>
            <div class="options-grid">
                ${generateOptions('menopause_erected_want', [
                    'Вообще не возбуждает',
                    'Немного возбуждает',
                    'Средне возбуждает',
                    'Сильно возбуждает',
                    'Очень сильно возбуждает'
                ])}
            </div>
        </div>
        
        <div class="question-block">
            <div class="question-text">Возбуждает ли Вас вид эрегированного полового члена в дни, когда НЕ хочется секса?</div>
            <div class="options-grid">
                ${generateOptions('menopause_erected_not_want', [
                    'Вообще не возбуждает',
                    'Немного возбуждает',
                    'Средне возбуждает',
                    'Сильно возбуждает',
                    'Очень сильно возбуждает'
                ])}
            </div>
        </div>
        
        <div class="question-block">
            <div class="question-text">Возбуждает ли Вас вид НЕэрегированного полового члена в дни, когда хочется секса?</div>
            <div class="options-grid">
                ${generateOptions('menopause_non_erected_want', [
                    'Вообще не возбуждает',
                    'Немного возбуждает',
                    'Средне возбуждает',
                    'Сильно возбуждает',
                    'Очень сильно возбуждает'
                ])}
            </div>
        </div>
        
        <div class="question-block">
            <div class="question-text">Возбуждает ли Вас вид НЕэрегированного полового члена в дни, когда НЕ хочется секса?</div>
            <div class="options-grid">
                ${generateOptions('menopause_non_erected_not_want', [
                    'Вообще не возбуждает',
                    'Немного возбуждает',
                    'Средне возбуждает',
                    'Сильно возбуждает',
                    'Очень сильно возбуждает'
                ])}
            </div>
        </div>
    `;
}

function generateOptions(name, options) {
    return options.map(option => `
        <label class="option-item">
            <input type="radio" name="${name}" value="${option}" required>
            ${option}
        </label>
    `).join('');
}

// Валидация формы регистрации
function validateRegistrationForm(form) {
    let isValid = true;
    
    // Сбрасываем предыдущие ошибки
    form.querySelectorAll('.error-message').forEach(error => {
        error.style.display = 'none';
    });
    form.querySelectorAll('.form-control.error').forEach(input => {
        input.classList.remove('error');
    });
    
    // Проверяем обязательные поля
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            const errorId = field.id + 'Error';
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                errorElement.style.display = 'block';
            }
        }
    });
    
    // Проверка фото (если загружено)
    const photoInput = document.getElementById('photo');
    if (photoInput.files[0]) {
        const file = photoInput.files[0];
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        
        if (!validTypes.includes(file.type)) {
            isValid = false;
            photoInput.classList.add('error');
            document.getElementById('photoError').style.display = 'block';
        }
        
        if (file.size > 5 * 1024 * 1024) {
            isValid = false;
            photoInput.classList.add('error');
            document.getElementById('photoError').textContent = 'Размер файла не должен превышать 5MB';
            document.getElementById('photoError').style.display = 'block';
        }
    }
    
    // Остальные проверки (возраст, телефон)...
    const age = document.getElementById('age');
    if (age.value) {
        const ageNum = parseInt(age.value);
        if (ageNum < 18 || ageNum > 80) {
            isValid = false;
            age.classList.add('error');
            document.getElementById('ageError').textContent = 'Пожалуйста, укажите возраст от 18 до 80 лет';
            document.getElementById('ageError').style.display = 'block';
        }
    }
    
    const phone = document.getElementById('phone');
    if (phone.value && !isValidPhone(phone.value)) {
        isValid = false;
        phone.classList.add('error');
        document.getElementById('phoneError').textContent = 'Пожалуйста, введите корректный номер телефона';
        document.getElementById('phoneError').style.display = 'block';
    }
    
    return isValid;
}

// Вспомогательная функция для проверки телефона
function isValidPhone(phone) {
    const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Обработчики форм
async function handleRegistrationSubmit(e) {
    e.preventDefault();
    
    if (!validateRegistrationForm(e.target)) {
        showNotification('Пожалуйста, заполните все обязательные поля корректно', 'error');
        return;
    }
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
        submitBtn.disabled = true;
        
        const formData = new FormData(form);
        registrationData = Object.fromEntries(formData.entries());
        
        // Обработка загрузки фото
        const photoInput = document.getElementById('photo');
        if (photoInput.files[0]) {
            const file = photoInput.files[0];
            
            // Проверка размера файла (5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Размер файла не должен превышать 5MB');
            }
            
            // Конвертация в base64
            registrationData.photo = await fileToBase64(file);
        } else {
            registrationData.photo = null;
        }
        
        // Отправляем в Telegram
        await sendRegistrationToTelegram(registrationData);
        
        showNotification('✅ Регистрация прошла успешно! Переходим к тесту.', 'success');
        
        localStorage.setItem('registrationCompleted', 'true');
        setTimeout(() => showSection('test'), 1500);
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showNotification('❌ Ошибка регистрации: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Функция для конвертации файла в base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

async function handleTestSubmit(e) {
    e.preventDefault();
    
    // Проверяем валидность последнего шага
    if (!validateStep(6)) {
        showErrorMessage('Пожалуйста, ответьте на все обязательные вопросы этого шага');
        return;
    }
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обработка...';
        submitBtn.disabled = true;
        
        // Собираем данные теста
        const formData = new FormData(form);
        testData = Object.fromEntries(formData.entries());
        
        // Рассчитываем результат
        const result = calculateTestResult(testData);
        
        // Показываем результат
        showTestResult(result);
        
        // Отправляем результаты в Telegram
        await sendTestResultsToTelegram(testData, result);
        
        // Разблокируем все разделы
        localStorage.setItem('diagnosticCompleted', 'true');
        unlockAllSections();
        
        showSuccessMessage('✅ Диагностика завершена! Теперь вам доступны все разделы сайта.');
        
    } catch (error) {
        console.error('Ошибка обработки теста:', error);
        showErrorMessage('❌ Ошибка обработки теста. Пожалуйста, попробуйте еще раз.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleConsultationSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        const formData = new FormData(form);
        const consultationData = Object.fromEntries(formData.entries());
        
        await sendConsultationToTelegram(consultationData);
        
        showSuccessMessage('✅ Заявка отправлена! Я свяжусь с вами в течение 24 часов.');
        form.reset();
        
    } catch (error) {
        console.error('Ошибка отправки заявки:', error);
        showErrorMessage('❌ Ошибка отправки заявки. Пожалуйста, попробуйте еще раз.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Функции для отправки в Telegram
async function sendRegistrationToTelegram(data) {
    try {
        // Отправляем текстовое сообщение
        let message = `🌟 *НОВАЯ РЕГИСТРАЦИЯ* 🌟\n\n`;
        message += `👤 *Контактная информация:*\n`;
        message += `   └ *Фамилия:* ${data.lastName}\n`;
        message += `   └ *Имя:* ${data.firstName}\n`;
        message += `   └ *Возраст:* ${data.age}\n`;
        message += `   └ *Телефон:* ${data.phone}\n`;
        message += `   └ *Telegram:* ${data.telegram}\n`;
        message += `\n⏰ *Дата регистрации:* ${new Date().toLocaleString('ru-RU')}`;

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();
        
        if (!response.ok || !result.ok) {
            throw new Error(result.description || 'Ошибка отправки в Telegram');
        }

        console.log('✅ Регистрация успешно отправлена в Telegram');
        
    } catch (error) {
        console.error('Ошибка отправки регистрации:', error);
        throw error;
    }
}

async function sendTestResultsToTelegram(data, result) {
    try {
        let message = `📊 *НОВЫЙ РЕЗУЛЬТАТ ТЕСТА* 📊\n\n`;
        message += `👤 *Пользователь:* ${registrationData.firstName} ${registrationData.lastName}\n`;
        message += `📱 *Telegram:* ${registrationData.telegram}\n\n`;
        message += `🔍 *Тип теста:* ${data.test_type === 'regular' ? 'Обычный' : 'Менопауза'}\n`;
        message += `📈 *Результат:* ${result.level}\n`;
        message += `⭐ *Баллы:* ${result.score}\n\n`;
        
        if (data.test_type === 'regular') {
            message += `📅 *Ответы по периодам:*\n`;
            
            const periods = [
                {name: 'От конца месячных до овуляции', prefix: 'period1'},
                {name: 'В период овуляции', prefix: 'period2'},
                {name: 'От конца овуляции до начала месячных', prefix: 'period3'},
                {name: 'В период месячных', prefix: 'period4'}
            ];
            
            periods.forEach(period => {
                message += `\n*${period.name}:*\n`;
                message += `   └ *Частота:* ${data[`${period.prefix}_frequency`] || 'Не указано'}\n`;
                message += `   └ *Сила желания:* ${data[`${period.prefix}_strength`] || 'Не указано'}\n`;
                message += `   └ *Эрегир. (да):* ${data[`${period.prefix}_erected_want`] || 'Не указано'}\n`;
                message += `   └ *Эрегир. (нет):* ${data[`${period.prefix}_erected_not_want`] || 'Не указано'}\n`;
                message += `   └ *Не эрегир. (да):* ${data[`${period.prefix}_non_erected_want`] || 'Не указано'}\n`;
                message += `   └ *Не эрегир. (нет):* ${data[`${period.prefix}_non_erected_not_want`] || 'Не указано'}\n`;
            });
        } else {
            message += `🔸 *Ответы для менопаузы:*\n`;
            message += `   └ *Частота:* ${data.menopause_frequency || 'Не указано'}\n`;
            message += `   └ *Сила желания:* ${data.menopause_strength || 'Не указано'}\n`;
            message += `   └ *Эрегир. (да):* ${data.menopause_erected_want || 'Не указано'}\n`;
            message += `   └ *Эрегир. (нет):* ${data.menopause_erected_not_want || 'Не указано'}\n`;
            message += `   └ *Не эрегир. (да):* ${data.menopause_non_erected_want || 'Не указано'}\n`;
            message += `   └ *Не эрегир. (нет):* ${data.menopause_non_erected_not_want || 'Не указано'}\n`;
        }
        
        message += `\n🍂 *Сезонная зависимость:* ${data.season_dependency || 'Не указано'}\n`;
        if (data.season_description) {
            message += `   └ *Описание:* ${data.season_description}\n`;
        }
        
        message += `\n⏰ *Дата заполнения:* ${new Date().toLocaleString('ru-RU')}`;

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const apiResult = await response.json();
        
        if (!response.ok || !apiResult.ok) {
            console.error('Ошибка Telegram API:', apiResult);
        } else {
            console.log('✅ Результаты теста успешно отправлены в Telegram');
        }

    } catch (error) {
        console.error('Ошибка отправки результатов теста:', error);
    }
}

async function sendConsultationToTelegram(data) {
    try {
        let message = `📅 *НОВАЯ ЗАЯВКА НА КОНСУЛЬТАЦИЮ* 📅\n\n`;
        message += `👤 *Имя:* ${data.name}\n`;
        message += `📧 *Email:* ${data.email}\n`;
        message += `💼 *Формат:* ${data.format}\n`;
        if (data.message) {
            message += `📝 *Запрос:* ${data.message}\n`;
        }
        message += `\n⏰ *Дата заявки:* ${new Date().toLocaleString('ru-RU')}`;

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();
        
        if (!response.ok || !result.ok) {
            throw new Error(result.description || 'Ошибка отправки в Telegram');
        }

        console.log('✅ Заявка на консультацию отправлена в Telegram');
        
    } catch (error) {
        console.error('Ошибка отправки заявки:', error);
        throw error;
    }
}

function calculateTestResult(data) {
    let totalScore = 0;
    const testType = data.test_type;
    
    // Система баллов для каждого ответа
    const scoreMap = {
        'frequency': {
            'Вообще не хочется': 0,
            'Хочется 1 раза в неделю': 1,
            'Хочется 1 раз в 3 дня': 2,
            'Хочется через день': 3,
            'Хочется каждый день': 4,
            'Хочется каждый день по много раз': 5
        },
        'strength': {
            'Легкое желание': 1,
            'Среднее желание': 2,
            'Сильное желание': 3,
            'Очень сильное желание': 4,
            'Максимально сильное желание(на столько,что почти невозможно терпеть)': 5
        },
        'arousal': {
            'Вообще не возбуждает': 0,
            'Немного возбуждает': 1,
            'Средне возбуждает': 2,
            'Сильно возбуждает': 3,
            'Очень сильно возбуждает': 4
        }
    };
    
    if (testType === 'regular') {
        // Подсчет для обычного теста (4 периода)
        for (let i = 1; i <= 4; i++) {
            const prefix = `period${i}_`;
            
            if (data[prefix + 'frequency']) {
                totalScore += scoreMap.frequency[data[prefix + 'frequency']] || 0;
            }
            if (data[prefix + 'strength']) {
                totalScore += scoreMap.strength[data[prefix + 'strength']] || 0;
            }
            if (data[prefix + 'erected_want']) {
                totalScore += scoreMap.arousal[data[prefix + 'erected_want']] || 0;
            }
            if (data[prefix + 'erected_not_want']) {
                totalScore += scoreMap.arousal[data[prefix + 'erected_not_want']] || 0;
            }
            if (data[prefix + 'non_erected_want']) {
                totalScore += scoreMap.arousal[data[prefix + 'non_erected_want']] || 0;
            }
            if (data[prefix + 'non_erected_not_want']) {
                totalScore += scoreMap.arousal[data[prefix + 'non_erected_not_want']] || 0;
            }
        }
        
        // Усредняем баллы
        totalScore = Math.round(totalScore / 4);
    } else {
        // Подсчет для теста менопаузы
        if (data.menopause_frequency) {
            totalScore += scoreMap.frequency[data.menopause_frequency] || 0;
        }
        if (data.menopause_strength) {
            totalScore += scoreMap.strength[data.menopause_strength] || 0;
        }
        if (data.menopause_erected_want) {
            totalScore += scoreMap.arousal[data.menopause_erected_want] || 0;
        }
        if (data.menopause_erected_not_want) {
            totalScore += scoreMap.arousal[data.menopause_erected_not_want] || 0;
        }
        if (data.menopause_non_erected_want) {
            totalScore += scoreMap.arousal[data.menopause_non_erected_want] || 0;
        }
        if (data.menopause_non_erected_not_want) {
            totalScore += scoreMap.arousal[data.menopause_non_erected_not_want] || 0;
        }
    }
    
    // Определяем уровень либидо
    let level, description;
    
    if (testType === 'regular') {
        if (totalScore <= 8) {
            level = 'Низкое либидо';
            description = 'Ваше либидо находится на низком уровне. Это может быть связано с гормональными изменениями, стрессом или другими факторами. Рекомендуется консультация для выявления причин и разработки индивидуального плана восстановления.';
        } else if (totalScore <= 16) {
            level = 'Среднее либидо';
            description = 'У вас средний уровень либидо. Есть потенциал для усиления сексуальной энергии через работу с гормональным балансом и психологическими аспектами.';
        } else if (totalScore <= 24) {
            level = 'Высокое либидо';
            description = 'Поздравляем! У вас высокий уровень либидо. Ваша сексуальная энергия находится в хорошем состоянии, но есть возможности для дальнейшего развития и гармонизации.';
        } else {
            level = 'Очень высокое либидо';
            description = 'У вас очень высокий уровень либидо! Это прекрасный показатель вашей сексуальной энергии. Важно научиться правильно направлять эту энергию для достижения гармонии во всех сферах жизни.';
        }
    } else {
        if (totalScore <= 6) {
            level = 'Низкое либидо в менопаузе';
            description = 'В период менопаузы снижение либидо является распространенным явлением из-за гормональных изменений. Существуют эффективные методы восстановления, включая гормональную терапию и натуральные подходы.';
        } else if (totalScore <= 12) {
            level = 'Среднее либидо в менопаузе';
            description = 'У вас сохраняется умеренный уровень либидо, что является хорошим показателем для периода менопаузы. Есть возможности для усиления сексуальной энергии через специальные методики.';
        } else if (totalScore <= 18) {
            level = 'Высокое либидо в менопаузе';
            description = 'Поздравляем! Несмотря на менопаузу, у вас сохраняется высокий уровень либидо. Это прекрасная основа для дальнейшего развития вашей сексуальности.';
        } else {
            level = 'Очень высокое либидо в менопаузе';
            description = 'У вас исключительно высокий уровень либидо для периода менопаузы! Это редкий и ценный показатель. Важно научиться управлять этой энергией для максимальной реализации.';
        }
    }
    
    return { level, description, score: totalScore, testType };
}

function showTestResult(result) {
    const resultLevel = document.getElementById('resultLevel');
    const resultDescription = document.getElementById('resultDescription');
    
    // Устанавливаем класс и текст
    if (result.level.includes('Низкое')) {
        resultLevel.className = 'result-level level-low';
    } else if (result.level.includes('Среднее')) {
        resultLevel.className = 'result-level level-medium';
    } else if (result.level.includes('Высокое')) {
        resultLevel.className = 'result-level level-high';
    } else {
        resultLevel.className = 'result-level level-very-high';
    }
    
    resultLevel.textContent = result.level;
    resultDescription.textContent = result.description;
    
    // Показываем секцию с результатом
    showResultSection();
    
    // Прокрутка к верху
    scrollToTop();
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
    
    // Сбрасываем прогресс
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

function showInfoMessage(text) {
    showNotification(text, 'info');
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
