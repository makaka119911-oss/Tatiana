// Конфигурация Telegram
const TELEGRAM_BOT_TOKEN = '8402206062:AAEJim1GkriKqY_o1mOo0YWSWQDdw5Qy2h0';
const TELEGRAM_CHAT_ID = '-1002313355102';
const ARCHIVE_PASSWORD = 'admin123';
const API_BASE_URL = 'https://tatiana-server-production.up.railway.app'; // Production API URL
// Глобальные переменные
let currentStep = 1;
let totalSteps = 6;
let testType = '';
let registrationData = {};
let testData = {};
let userPhoto = null;
let archiveData = [];
let itemsPerPage = 10;
let currentArchivePage = 1;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт загружен');

    // Проверяем, пройдена ли диагностика
    checkDiagnosticStatus();

    // Инициализация
    initEventListeners();
    initTestSteps();
    initPhotoUpload();
    initArchive();
});

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

    // Сезонная зависимость
    document.querySelectorAll('input[name="season_dependency"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const description = document.getElementById('seasonDescription');
            if (description) {
                description.style.display = this.value === 'Да' ? 'block' : 'none';
            }
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

// Hash-based navigation handler
window.addEventListener('hashchange', function() {
  const hash = window.location.hash.substring(1); // Remove the '#'
  
  if (hash) {
    switch(hash) {
      case 'registration':
        showRegistrationSection();
        break;
      case 'test':
        showTestSection();
        break;
      case 'result':
        showResultSection();
        break;
      case 'about':
        showAboutSection();
        break;
      case 'power':
        showPowerSection();
        break;
      case 'services':
        showServicesSection();
        break;
      case 'process':
        showProcessSection();
        break;
      case 'awakening':
        showAwakeningSection();
        break;
      case 'contacts':
        showContactsSection();
        break;
      case 'archive':
        showArchiveSection();
        break;
      default:
        // Show hero if no valid section
        hideAllSections();
        document.querySelector('.hero').classList.remove('section-hidden');
    }
  } else {
    // Show hero when no hash
    hideAllSections();
    document.querySelector('.hero').classList.remove('section-hidden');
  }
});

// Handle initial page load with hash
if (window.location.hash) {
  window.dispatchEvent(new Event('hashchange'));
} else {
  // Show hero on initial load if no hash
  hideAllSections();
  document.querySelector('.hero').classList.remove('section-hidden');
}

function initPhotoUpload() {
    const photoInput = document.getElementById('photoInput');
    const photoUploadArea = document.getElementById('photoUploadArea');
    const photoPreview = document.getElementById('photoPreview');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const uploadButton = document.getElementById('uploadButton');
    const removePhotoButton = document.getElementById('removePhotoButton');

    // Обработчик выбора файла
    photoInput.addEventListener('change', function(e) {
        handlePhotoUpload(e);
    });

    // Обработчик клика по кнопке загрузки
    uploadButton.addEventListener('click', function(e) {
        e.stopPropagation();
        photoInput.click();
    });

    // Обработчик удаления фото
    removePhotoButton.addEventListener('click', function(e) {
        e.stopPropagation();
        removePhoto();
    });

    // Drag and drop функционал
    photoUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    photoUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });

    photoUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });

    // Клик по области загрузки
    photoUploadArea.addEventListener('click', function() {
        photoInput.click();
    });

    function handleFileSelection(file) {
        // Проверка типа файла
        if (!file.type.match('image.*')) {
            showNotification('Пожалуйста, выберите файл изображения (JPG, PNG, GIF)', 'error');
            return;
        }

        // Проверка размера файла (5 МБ)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Размер файла не должен превышать 5 МБ', 'error');
            return;
        }

        userPhoto = file;

        // Показываем превью
        const reader = new FileReader();
        reader.onload = function(e) {
            photoPreview.src = e.target.result;
            photoPreviewContainer.style.display = 'block';
            
            // Скрываем ошибку если была
            document.getElementById('photoError').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    function handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    }
}

function removePhoto() {
    userPhoto = null;
    document.getElementById('photoInput').value = '';
    document.getElementById('photoPreviewContainer').style.display = 'none';
    document.getElementById('photoPreview').src = '';
}

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

function nextStep(step) {
    // Проверяем валидность текущего шага перед переходом
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
        
        // Генерируем шаги на основе типа теста
        generateTestSteps(testType.value);
        totalSteps = testType.value === 'regular' ? 6 : 2;
    }
    
    document.querySelector('.test-step.active').classList.remove('active');
    document.getElementById('step' + step).classList.add('active');
    currentStep = step;
    
    updateProgress();
    
    // Прокрутка к верху страницы
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
        if (field.type === 'file') {
            if (!userPhoto) {
                isValid = false;
                document.getElementById('photoError').style.display = 'block';
            } else {
                document.getElementById('photoError').style.display = 'none';
            }
        } else if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            const errorId = field.id + 'Error';
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                errorElement.style.display = 'block';
            }
        }
    });
    
    // Дополнительные проверки
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
        
        // Собираем данные формы
        const formData = new FormData(form);
        registrationData = Object.fromEntries(formData.entries());
        
        // Проверяем наличие фото
        if (!userPhoto) {
            throw new Error('Пожалуйста, загрузите фотографию');
        }
        
        // Отправляем в Telegram
        await sendRegistrationToTelegram(registrationData, userPhoto);
        
        showNotification('✅ Регистрация прошла успешно! Переходим к тесту.', 'success');
        
        // Сохраняем статус и показываем тест
        localStorage.setItem('registrationCompleted', 'true');
        setTimeout(() => showTestSection(), 1500);
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showNotification('❌ Ошибка регистрации: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleTestSubmit(e) {
    e.preventDefault();
    
    // Проверяем валидность последнего шага
    if (!validateStep(6)) {
        showNotification('Пожалуйста, ответьте на все обязательные вопросы этого шага', 'error');
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
        
        // Сохраняем в архив
        saveToArchive(registrationData, testData, result, userPhoto);
        
        // Отправляем результаты в Telegram
        await sendTestResultsToTelegram(testData, result);
        
        // Разблокируем все разделы
        localStorage.setItem('diagnosticCompleted', 'true');
        unlockAllSections();
        
        showNotification('✅ Диагностика завершена! Теперь вам доступны все разделы сайта.', 'success');
        
    } catch (error) {
        console.error('Ошибка обработки теста:', error);
        showNotification('❌ Ошибка обработки теста. Пожалуйста, попробуйте еще раз.', 'error');
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
        
        showNotification('✅ Заявка отправлена! Я свяжусь с вами в течение 24 часов.', 'success');
        form.reset();
        
    } catch (error) {
        console.error('Ошибка отправки заявки:', error);
        showNotification('❌ Ошибка отправки заявки. Пожалуйста, попробуйте еще раз.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Функции для отправки в Telegram
async function sendRegistrationToTelegram(data, photoFile) {
    try {
        // Сначала отправляем текстовое сообщение
        let message = `🌟 *НОВАЯ РЕГИСТРАЦИЯ* 🌟\n\n`;
        message += `👤 *Контактная информация:*\n`;
        message += `   └ *Фамилия:* ${data.lastName}\n`;
        message += `   └ *Имя:* ${data.firstName}\n`;
        message += `   └ *Возраст:* ${data.age}\n`;
        message += `   └ *Телефон:* ${data.phone}\n`;
        message += `   └ *Telegram:* ${data.telegram}\n`;
        message += `   └ *Фото:* ${photoFile ? 'Да' : 'Нет'}\n`;
        message += `\n⏰ *Дата регистрации:* ${new Date().toLocaleString('ru-RU')}`;

        const textResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
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

        const textResult = await textResponse.json();
        
        if (!textResponse.ok || !textResult.ok) {
            throw new Error(textResult.description || 'Ошибка отправки текста в Telegram');
        }

        // Затем отправляем фото, если есть
        if (photoFile) {
            await sendPhotoToTelegram(photoFile, `Фото: ${data.firstName} ${data.lastName}`);
        }

        console.log('✅ Регистрация успешно отправлена в Telegram');
        
    } catch (error) {
        console.error('Ошибка отправки регистрации:', error);
        throw error;
    }
}

async function sendPhotoToTelegram(photoFile, caption) {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', photoFile);
    formData.append('caption', caption.substring(0, 200));

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        
        if (!result.ok) {
            throw new Error(result.description || 'Неизвестная ошибка загрузки фото');
        }

        console.log('✅ Фото успешно отправлено в Telegram');
        
    } catch (error) {
        console.error('Ошибка отправки фото:', error);
        throw new Error('Не удалось отправить фото: ' + error.message);
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
            description = 'У вас исключительно высокий уровень либидо для периода менопаузы! Это редкий и ценный показатель. Ваша сексуальная энергия может стать источником творчества и vitality.';
        }
    }
    
    return { level, description, score: totalScore, testType };
}

function showTestResult(result) {
    const resultLevel = document.getElementById('resultLevel');
    const resultDescription = document.getElementById('resultDescription');
    
    // Добавляем иконки в зависимости от уровня
    let icon = '';
    if (result.level.includes('Низкое')) {
        resultLevel.className = 'result-level level-low';
        icon = '<i class="fas fa-seedling" style="margin-right: 15px;"></i>';
    } else if (result.level.includes('Среднее')) {
        resultLevel.className = 'result-level level-medium';
        icon = '<i class="fas fa-leaf" style="margin-right: 15px;"></i>';
    } else if (result.level.includes('Высокое')) {
        resultLevel.className = 'result-level level-high';
        icon = '<i class="fas fa-fire" style="margin-right: 15px;"></i>';
    } else {
        resultLevel.className = 'result-level level-very-high';
        icon = '<i class="fas fa-crown" style="margin-right: 15px;"></i>';
    }
    
    resultLevel.innerHTML = icon + result.level;
    resultDescription.innerHTML = `
        <div class="result-score">
            <strong>Ваш балл:</strong> ${result.score} из 30
        </div>
        <div class="result-text">
            ${result.description}
        </div>
    `;
    
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

function hideAllSections() {
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('section-hidden');
    });
}

// Уведомления
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

// ==================== АРХИВ ====================

function initArchive() {
    // Секретная кнопка
    document.getElementById('secretArchiveBtn').addEventListener('click', function() {
        showArchiveSection();
    });
    
    // Форма входа в архив
    const loginForm = document.getElementById('archiveLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('archivePassword').value;
            
            if (password === ARCHIVE_PASSWORD) {
                document.getElementById('archiveLogin').style.display = 'none';
                document.getElementById('archiveContent').style.display = 'block';
                document.getElementById('archivePasswordError').style.display = 'none';
                
                // Загружаем и отображаем данные
                loadArchiveData();
                displayArchiveData(archiveData, 1);
                
                showNotification('✅ Доступ к архиву разрешен', 'success');
            } else {
                document.getElementById('archivePasswordError').style.display = 'block';
                showNotification('❌ Неверный пароль', 'error');
            }
        });
    }
    
    // Поиск и фильтры
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


// API configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Function to save data to localStorage
function saveToLocalStorage(userData, testData, testResult, photoBase64) {
    const existingData = JSON.parse(localStorage.getItem('libidoTestArchive') || '[]');
    existingData.push({
        ...userData,
        photo: photoBase64,
        testData,
        testResult,
        timestamp: new Date().toISOString(),
        completed: true
    });
    localStorage.setItem('libidoTestArchive', JSON.stringify(existingData));
    console.log('✅ Data saved to localStorage');
}

// Async function to save archive data with server support
async function saveToArchive(userData, testData, testResult, photoFile) {
    try {
        console.log('📤 Saving data to archive...');
        
        // Convert photo to base64
        let photoBase64 = '';
        if (photoFile) {
            photoBase64 = await fileToBase64(photoFile);
        }
        
        // Prepare data object
        const archiveData = {
            ...userData,
            photo: photoBase64,
            testData,
            testResult,
            timestamp: new Date().toISOString(),
            completed: true
        };
        
        // Try to send to server
        try {
            const response = await fetch(`${API_BASE_URL}/archive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(archiveData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Data successfully saved to server', result);
                return result;
            } else {
                console.log('❌ Server error, falling back to localStorage');
                saveToLocalStorage(userData, testData, testResult, photoBase64);
            }
        } catch (serverError) {
            console.log('❌ Server connection failed, saving to localStorage instead');
            saveToLocalStorage(userData, testData, testResult, photoBase64);
        }
    } catch (error) {
        console.error('❌ Error in saveToArchive:', error);
        // Save to localStorage as final fallback
        saveToLocalStorage(userData, testData, testResult, '');
    }
}

// Function to load archive data from server with localStorage fallback
async function loadArchiveData() {
    try {
        let serverData = [];
        let localData = [];
        
        // Try to fetch from server
        try {
            const response = await fetch(`${API_BASE_URL}/archive`);
            if (response.ok) {
                serverData = await response.json();
                console.log('✅ Loaded data from server');
            } else {
                console.log('⚠️ Could not fetch from server, using localStorage');
            }
        } catch (serverError) {
            console.log('⚠️ Server unreachable, using localStorage');
        }
        
        // Load from localStorage
        localData = JSON.parse(localStorage.getItem('libidoTestArchive') || '[]');
        
        // Merge data and remove duplicates by ID
        const mergedData = [...serverData];
        const serverIds = new Set(serverData.map(item => item.id));
        localData.forEach(item => {
            if (!serverIds.has(item.id)) {
                mergedData.push(item);
            }
        });
        
        console.log('✅ Archive data loaded successfully');
        return mergedData;
    } catch (error) {
        console.error('❌ Error loading archive data:', error);
        return JSON.parse(localStorage.getItem('libidoTestArchive') || '[]');
    }
}

// Function to delete user data from archive
async function deleteUserData(userId) {
    try {
        if (!confirm('Are you sure you want to delete this user\'s data?')) {
            console.log('Delete operation cancelled');
            return false;
        }
        
        console.log('🗑️ Deleting user data...');
        
        // Try to delete from server
        try {
            const response = await fetch(`${API_BASE_URL}/archive/${userId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                console.log('✅ Data deleted from server');
            } else {
                console.log('⚠️ Could not delete from server');
            }
        } catch (serverError) {
            console.log('⚠️ Server unreachable for delete');
        }
        
        // Delete from localStorage
        const existingData = JSON.parse(localStorage.getItem('libidoTestArchive') || '[]');
        const filteredData = existingData.filter(item => item.userId !== userId);
        localStorage.setItem('libidoTestArchive', JSON.stringify(filteredData));
        console.log('✅ Data deleted from localStorage');
        
        return true;
    } catch (error) {
        console.error('❌ Error deleting user data:', error);
        return false;
    }
}

function searchArchive(query, levelFilter, testTypeFilter) {
    let filteredData = loadArchiveData();
    
    // Поиск по тексту
    if (query) {
        const searchTerm = query.toLowerCase();
        filteredData = filteredData.filter(item => 
            item.userData.firstName.toLowerCase().includes(searchTerm) ||
            item.userData.lastName.toLowerCase().includes(searchTerm) ||
            item.testResult.level.toLowerCase().includes(searchTerm) ||
            item.userData.telegram.toLowerCase().includes(searchTerm) ||
            item.userData.phone.includes(query)
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
    currentArchivePage = page;
    
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

function getLevelClass(level) {
    if (level.includes('Низкое')) return 'level-badge-low';
    if (level.includes('Среднее')) return 'level-badge-medium';
    if (level.includes('Высокое')) return 'level-badge-high';
    if (level.includes('Очень высокое')) return 'level-badge-very-high';
    return '';
}

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

function deleteUserData(userId) {
    if (!confirm('Вы уверены, что хотите удалить данные этого пользователя?')) {
        return;
    }
    
    archiveData = archiveData.filter(item => item.id !== userId);
    localStorage.setItem('libidoTestArchive', JSON.stringify(archiveData));
    
    // Перезагружаем таблицу
    displayArchiveData(archiveData, currentArchivePage);
    showNotification('✅ Данные пользователя удалены', 'success');
}

function exportToExcel() {
    const data = loadArchiveData();
    
    if (data.length === 0) {
        showNotification('❌ Нет данных для экспорта', 'error');
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
    
    showNotification('✅ Данные экспортированы в CSV файл', 'success');
}

// ========== ФУНКЦИИ ОТОБРАЖЕНИЯ АРХИВА ==========
const itemsPerPage = 10;
let currentArchivePage = 1;

function displayArchiveData(data, page = 1) {
    const tableBody = document.getElementById('resultsTableBody');
    const cardsContainer = document.getElementById('archiveCards');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (cardsContainer) cardsContainer.innerHTML = '';
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    currentArchivePage = page;
    pageData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><div style="display: flex; align-items: center; gap: 10px;">
                ${getUserPhoto(item.userData)}
                <span>${item.userData.lastName} ${item.userData.firstName}</span>
            </div></td>
            <td>${item.userData.age}</td>
            <td>${formatPhone(item.userData.phone)}</td>
            <td>${item.userData.telegram}</td>
            <td>${item.testResult.testType === 'regular' ? 'Обычный' : 'Менопауза'}</td>
            <td><span class="level-badge ${getLevelClass(item.testResult.level)}">${item.testResult.level}</span></td>
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
    if (cardsContainer) {
        pageData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'archive-card';
            card.innerHTML = `
                <div class="archive-card-header">
                    ${getUserPhoto(item.userData, 'archive-card-photo')}
                    <div class="archive-card-info">
                        <h4>${item.userData.lastName} ${item.userData.firstName}</h4>
                        <span class="level-badge ${getLevelClass(item.testResult.level)}">${item.testResult.level}</span>
                    </div>
                </div>
                <div class="archive-card-details">
                    <div><strong>Возраст:</strong> ${item.userData.age}</div>
                    <div><strong>Телефон:</strong> ${formatPhone(item.userData.phone)}</div>
                    <div><strong>Telegram:</strong> ${item.userData.telegram}</div>
                    <div><strong>Тип:</strong> ${item.testResult.testType === 'regular' ? 'Обычный' : 'Менопауза'}</div>
                    <div><strong>Баллы:</strong> ${item.testResult.score}</div>
                    <div><strong>Дата:</strong> ${new Date(item.timestamp).toLocaleDateString('ru-RU')}</div>
                </div>
                <div class="archive-card-actions">
                    <button class="btn-view-details" onclick="viewUserDetails('${item.id}')">
                        <i class="fas fa-eye"></i> Подробнее
                    </button>
                    <button class="btn-delete" onclick="deleteUserData('${item.id}')">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            `;
            cardsContainer.appendChild(card);
        });
    }
    updatePagination(totalPages, page);
    updateArchiveStats(data);
}

function getUserPhoto(userData, className = '') {
    if (userData.photoUrl) {
        return `<img src="${userData.photoUrl}" alt="Фото" class="${className}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`;
    }
    return `<div class="${className}" style="width: 40px; height: 40px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center;"><i class="fas fa-user" style="color: #ccc;"></i></div>`;
}

function formatPhone(phone) {
    if (!phone) return '-';
    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
}

function getLevelClass(level) {
    switch(level) {
        case 'low': return 'level-low';
        case 'medium': return 'level-medium';
        case 'high': return 'level-high';
        default: return 'level-unknown';
    }
}

function updatePagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '< Назад';
        prevBtn.onclick = () => displayArchiveData(loadArchiveData(), currentPage - 1);
        pagination.appendChild(prevBtn);
    }
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.onclick = () => displayArchiveData(loadArchiveData(), i);
        pagination.appendChild(pageBtn);
    }
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Вперёд >';
        nextBtn.onclick = () => displayArchiveData(loadArchiveData(), currentPage + 1);
        pagination.appendChild(nextBtn);
    }
}

function updateArchiveStats(data) {
    const statsContainer = document.getElementById('archiveStats');
    if (!statsContainer) return;
    const totalCount = data.length;
    const lowLevel = data.filter(item => item.testResult.level === 'low').length;
    const mediumLevel = data.filter(item => item.testResult.level === 'medium').length;
    const highLevel = data.filter(item => item.testResult.level === 'high').length;
    statsContainer.innerHTML = `
        <div><strong>Всего:</strong> ${totalCount}</div>
        <div><strong>Низкий:</strong> ${lowLevel}</div>
        <div><strong>Средний:</strong> ${mediumLevel}</div>
        <div><strong>Высокий:</strong> ${highLevel}</div>
    `;
}

function viewUserDetails(userId) {
    showNotification('ℹ️ Функция просмотра деталей будет добавлена позже', 'info');
}
