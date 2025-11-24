// ===== TATIANA WEBSITE - MAIN SCRIPT =====

// Конфигурация Telegram
const TELEGRAM_BOT_TOKEN = '8402206062:AAEJim1GkriKqY_o1mOo0YWSWQDdw5Qy2h0';
const TELEGRAM_CHAT_ID = '-1002313355102';

// API конфигурация
const API_BASE_URL = 'https://tatiana-server-production.up.railway.app';

// Глобальные переменные
let currentStep = 1;
let totalSteps = 6;
let testData = {};
let registrationData = {};
let userPhoto = null;
let currentRegistrationId = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Сайт загружен - инициализация системы...');
    checkDiagnosticStatus();
    currentRegistrationId = localStorage.getItem('registrationId');
    initEventListeners();
    initTestSteps();
    initPhotoUpload();
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
            description.style.display = this.value === 'Да' ? 'block' : 'none';
        });
    });

    // Навигационные ссылки
    initNavigationLinks();
    initMobileMenu();
}

function initNavigationLinks() {
    const linkHandlers = {
        'registration-link': showRegistrationSection,
        'consultation-link': showContactsSection,
        'about-link': showAboutSection,
        'power-link': showPowerSection,
        'services-link': showServicesSection,
        'process-link': showProcessSection,
        'awakening-link': showAwakeningSection,
        'contacts-link': showContactsSection
    };

    Object.entries(linkHandlers).forEach(([className, handler]) => {
        document.querySelectorAll(`.${className}`).forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                handler();
            });
        });
    });
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.innerHTML = navLinks.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
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

function initPhotoUpload() {
    const photoInput = document.getElementById('photoInput');
    const photoUploadArea = document.getElementById('photoUploadArea');
    const uploadButton = document.getElementById('uploadButton');
    const removePhotoButton = document.getElementById('removePhotoButton');

    if (!photoInput || !photoUploadArea) return;

    photoInput.addEventListener('change', handlePhotoUpload);
    uploadButton.addEventListener('click', function(e) {
        e.stopPropagation();
        photoInput.click();
    });
    removePhotoButton.addEventListener('click', function(e) {
        e.stopPropagation();
        removePhoto();
    });

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
    photoUploadArea.addEventListener('click', function() {
        photoInput.click();
    });

    function handleFileSelection(file) {
        if (!file.type.match('image.*')) {
            showErrorMessage('Пожалуйста, выберите файл изображения (JPG, PNG, GIF)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showErrorMessage('Размер файла не должен превышать 5 МБ');
            return;
        }
        userPhoto = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photoPreview').src = e.target.result;
            document.getElementById('photoPreviewContainer').style.display = 'block';
            document.getElementById('photoError').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    function handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (file) handleFileSelection(file);
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

    stepElement.querySelectorAll('.error-message').forEach(error => error.style.display = 'none');
    stepElement.querySelectorAll('.form-control.error').forEach(input => input.classList.remove('error'));
    stepElement.querySelectorAll('.question-block').forEach(block => block.classList.remove('error-highlight'));

    requiredInputs.forEach(input => {
        if (input.type === 'radio') {
            const radioGroup = stepElement.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) {
                isValid = false;
                const errorElement = document.getElementById(input.name + 'Error');
                if (errorElement) errorElement.style.display = 'block';
                const questionBlock = input.closest('.question-block');
                if (questionBlock) questionBlock.classList.add('error-highlight');
            }
        } else {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                const errorElement = document.getElementById(input.name + 'Error');
                if (errorElement) errorElement.style.display = 'block';
            }
        }
    });

    return isValid;
}

function nextStep(step) {
    if (!validateStep(currentStep)) {
        showErrorMessage('Пожалуйста, ответьте на все обязательные вопросы этого шага');
        return;
    }
    if (step === 2) {
        const testType = document.querySelector('input[name="test_type"]:checked');
        if (!testType) {
            showErrorMessage('Пожалуйста, выберите тип теста');
            return;
        }
        generateTestSteps(testType.value);
        totalSteps = testType.value === 'regular' ? 6 : 2;
    }
    document.querySelector('.test-step.active').classList.remove('active');
    document.getElementById('step' + step).classList.add('active');
    currentStep = step;
    updateProgress();
    scrollToTop();
}

function prevStep(step) {
    document.querySelector('.test-step.active').classList.remove('active');
    document.getElementById('step' + step).classList.add('active');
    currentStep = step;
    updateProgress();
    scrollToTop();
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    const progressBar = document.getElementById('testProgress');
    const progressText = document.getElementById('progressText');
    if (progressBar) progressBar.style.width = progress + '%';
    if (progressText) progressText.textContent = `Шаг ${currentStep} из ${totalSteps}`;
}

function generateTestSteps(testType) {
    document.querySelectorAll('.test-step:not(#step1):not(#step6)').forEach(step => step.remove());
    
    if (testType === 'regular') {
        const periods = [
            { id: 1, name: 'От конца месячных до овуляции' },
            { id: 2, name: 'В период овуляции' },
            { id: 3, name: 'От конца овуляции до начала месячных' },
            { id: 4, name: 'В период месячных' }
        ];
        
        periods.forEach((period, index) => {
            const stepNumber = index + 2;
            const stepHTML = createPeriodStep(stepNumber, period);
            document.getElementById('step6').insertAdjacentHTML('beforebegin', stepHTML);
        });
        totalSteps = 6;
    } else {
        const stepHTML = createMenopauseStep();
        document.getElementById('step6').insertAdjacentHTML('beforebegin', stepHTML);
        totalSteps = 2;
    }
    initTestSteps();
}

function createPeriodStep(stepNumber, period) {
    return `
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
}

function createMenopauseStep() {
    return `
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
}

function generatePeriodQuestions(periodId, periodName) {
    const questions = [
        { name: 'frequency', text: `Как часто хочется секса в период "${periodName}"?` },
        { name: 'strength', text: 'Сила желания в те дни, когда хочется секса?' },
        { name: 'erected_want', text: 'Возбуждает ли Вас вид эрегированного полового члена в дни, когда хочется секса?' },
        { name: 'erected_not_want', text: 'Возбуждает ли Вас вид эрегированного полового члена в дни, когда НЕ хочется секса?' },
        { name: 'non_erected_want', text: 'Возбуждает ли Вас вид НЕэрегированного полового члена в дни, когда хочется секса?' },
        { name: 'non_erected_not_want', text: 'Возбуждает ли Вас вид НЕэрегированного полового члена в дни, когда НЕ хочется секса?' }
    ];

    const options = {
        frequency: ['Вообще не хочется', 'Хочется 1 раза в неделю', 'Хочется 1 раз в 3 дня', 'Хочется через день', 'Хочется каждый день', 'Хочется каждый день по много раз'],
        strength: ['Легкое желание', 'Среднее желание', 'Сильное желание', 'Очень сильное желание', 'Максимально сильное желание(на столько,что почти невозможно терпеть)'],
        erected_want: ['Вообще не возбуждает', 'Немного возбуждает', 'Средне возбуждает', 'Сильно возбуждает', 'Очень сильно возбуждает'],
        erected_not_want: ['Вообще не возбуждает', 'Немного возбуждает', 'Средне возбуждает', 'Сильно возбуждает', 'Очень сильно возбуждает'],
        non_erected_want: ['Вообще не возбуждает', 'Немного возбуждает', 'Средне возбуждает', 'Сильно возбуждает', 'Очень сильно возбуждает'],
        non_erected_not_want: ['Вообще не возбуждает', 'Немного возбуждает', 'Средне возбуждает', 'Сильно возбуждает', 'Очень сильно возбуждает']
    };

    return questions.map(question => `
        <div class="question-block">
            <div class="question-text">${question.text}</div>
            <div class="options-grid">
                ${generateOptions(`period${periodId}_${question.name}`, options[question.name])}
            </div>
        </div>
    `).join('');
}

function generateMenopauseQuestions() {
    const questions = [
        { name: 'frequency', text: 'Как часто хочется секса в текущий период?' },
        { name: 'strength', text: 'Сила желания в те дни, когда хочется секса?' },
        { name: 'erected_want', text: 'Возбуждает ли Вас вид эрегированного полового члена в дни, когда хочется секса?' },
        { name: 'erected_not_want', text: 'Возбуждает ли Вас вид эрегированного полового члена в дни, когда НЕ хочется секса?' },
        { name: 'non_erected_want', text: 'Возбуждает ли Вас вид НЕэрегированного полового члена в дни, когда хочется секса?' },
        { name: 'non_erected_not_want', text: 'Возбуждает ли Вас вид НЕэрегированного полового члена в дни, когда НЕ хочется секса?' }
    ];

    const options = {
        frequency: ['Вообще не хочется', 'Хочется 1 раза в неделю', 'Хочется 1 раз в 3 дня', 'Хочется через день', 'Хочется каждый день', 'Хочется каждый день по много раз'],
        strength: ['Легкое желание', 'Среднее желание', 'Сильное желание', 'Очень сильное желание', 'Максимально сильное желание(на столько,что почти невозможно терпеть)'],
        erected_want: ['Вообще не возбуждает', 'Немного возбуждает', 'Средне возбуждает', 'Сильно возбуждает', 'Очень сильно возбуждает'],
        erected_not_want: ['Вообще не возбуждает', 'Немного возбуждает', 'Средне возбуждает', 'Сильно возбуждает', 'Очень сильно возбуждает'],
        non_erected_want: ['Вообще не возбуждает', 'Немного возбуждает', 'Средне возбуждает', 'Сильно возбуждает', 'Очень сильно возбуждает'],
        non_erected_not_want: ['Вообще не возбуждает', 'Немного возбуждает', 'Средне возбуждает', 'Сильно возбуждает', 'Очень сильно возбуждает']
    };

    return questions.map(question => `
        <div class="question-block">
            <div class="question-text">${question.text}</div>
            <div class="options-grid">
                ${generateOptions(`menopause_${question.name}`, options[question.name])}
            </div>
        </div>
    `).join('');
}

function generateOptions(name, options) {
    return options.map(option => `
        <label class="option-item">
            <input type="radio" name="${name}" value="${option}" required>
            ${option}
        </label>
    `).join('');
}

function validateRegistrationForm(form) {
    let isValid = true;
    form.querySelectorAll('.error-message').forEach(error => error.style.display = 'none');
    form.querySelectorAll('.form-control.error').forEach(input => input.classList.remove('error'));
    
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (field.type === 'file') {
            if (!userPhoto) {
                isValid = false;
                document.getElementById('photoError').style.display = 'block';
            }
        } else if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            const errorElement = document.getElementById(field.id + 'Error');
            if (errorElement) errorElement.style.display = 'block';
        }
    });
    
    const age = document.getElementById('age');
    if (age.value && (parseInt(age.value) < 18 || parseInt(age.value) > 80)) {
        isValid = false;
        age.classList.add('error');
        document.getElementById('ageError').textContent = 'Пожалуйста, укажите возраст от 18 до 80 лет';
        document.getElementById('ageError').style.display = 'block';
    }
    
    return isValid;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

async function handleRegistrationSubmit(e) {
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

        const formData = new FormData(form);
        registrationData = Object.fromEntries(formData.entries());
        
        // ВАЖНО: Добавляем фото в данные
        if (userPhoto) {
            try {
                registrationData.photo_data = await fileToBase64(userPhoto);
                console.log('✅ Фото преобразовано в base64, длина:', registrationData.photo_data.length);
            } catch (photoError) {
                console.error('❌ Ошибка преобразования фото:', photoError);
                registrationData.photo_data = null;
            }
        } else {
            console.log('⚠️ Фото не загружено');
            registrationData.photo_data = null;
        }

        console.log('📤 Отправка данных на сервер:', { 
            ...registrationData, 
            photo_data: registrationData.photo_data ? `base64 длиной ${registrationData.photo_data.length}` : 'null' 
        });

        // Отправляем на сервер Railway
        const serverResponse = await fetch(API_BASE_URL + '/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData)
        });

        const responseData = await serverResponse.json();
        console.log('📊 Ответ сервера:', responseData);

        if (!serverResponse.ok || !responseData.success) {
            throw new Error(responseData.error || 'Registration failed');
        }

        currentRegistrationId = responseData.registrationId;
        localStorage.setItem('registrationId', currentRegistrationId);

        // Отправляем в Telegram
        await sendRegistrationToTelegram(registrationData, userPhoto);

        showSuccessMessage('✅ Регистрация прошла успешно! Переходим к тесту.');
        localStorage.setItem('registrationCompleted', 'true');
        setTimeout(() => showTestSection(), 1500);

    } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
        showErrorMessage('❌ Ошибка регистрации: ' + error.message);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleTestSubmit(e) {
    e.preventDefault();
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

        const registrationId = localStorage.getItem('registrationId') || currentRegistrationId;
        if (!registrationId) throw new Error('Не найден ID регистрации');

        const formData = new FormData(form);
        testData = Object.fromEntries(formData.entries());
        const result = calculateTestResult(testData);

        // Отправляем на сервер Railway
        const testResponse = await fetch(API_BASE_URL + '/api/test-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationId, level: result.level, score: result.score, testData })
        });

        const testResponseData = await testResponse.json();
        if (!testResponse.ok || !testResponseData.success) {
            throw new Error(testResponseData.error || 'Test submission failed');
        }

        await sendTestResultsToTelegram(testData, result);
        showTestResult(result);
        localStorage.setItem('diagnosticCompleted', 'true');
        unlockAllSections();
        showSuccessMessage('✅ Диагностика завершена!');

    } catch (error) {
        console.error('❌ Ошибка обработки теста:', error);
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
        showErrorMessage('❌ Ошибка отправки заявки. Пожалуйста, попробуйте еще раз.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function sendRegistrationToTelegram(data, photoFile) {
    try {
        let message = `🌟 *НОВАЯ РЕГИСТРАЦИЯ* 🌟\n\n`;
        message += `👤 *ФИО:* ${data.lastName} ${data.firstName}\n`;
        message += `📅 *Возраст:* ${data.age}\n`;
        message += `📞 *Телефон:* ${data.phone}\n`;
        message += `✈️ *Telegram:* ${data.telegram}\n`;
        message += `🖼️ *Фото:* ${photoFile ? 'Да' : 'Нет'}\n`;
        message += `\n⏰ *Дата:* ${new Date().toLocaleString('ru-RU')}`;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' })
        });

        if (photoFile) {
            const formData = new FormData();
            formData.append('chat_id', TELEGRAM_CHAT_ID);
            formData.append('photo', photoFile);
            formData.append('caption', `Фото: ${data.firstName} ${data.lastName}`);
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, { method: 'POST', body: formData });
        }
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error);
    }
}

async function sendTestResultsToTelegram(data, result) {
    try {
        let message = `📊 *НОВЫЙ РЕЗУЛЬТАТ ТЕСТА* 📊\n\n`;
        message += `👤 *Пользователь:* ${registrationData.firstName} ${registrationData.lastName}\n`;
        message += `📱 *Telegram:* ${registrationData.telegram}\n`;
        message += `🔍 *Тип теста:* ${data.test_type === 'regular' ? 'Обычный' : 'Менопауза'}\n`;
        message += `📈 *Результат:* ${result.level}\n`;
        message += `⭐ *Баллы:* ${result.score}\n`;
        message += `\n⏰ *Дата:* ${new Date().toLocaleString('ru-RU')}`;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' })
        });
    } catch (error) {
        console.error('Ошибка отправки результатов:', error);
    }
}

async function sendConsultationToTelegram(data) {
    try {
        let message = `📅 *НОВАЯ ЗАЯВКА НА КОНСУЛЬТАЦИЮ* 📅\n\n`;
        message += `👤 *Имя:* ${data.name}\n`;
        message += `📧 *Email:* ${data.email}\n`;
        message += `💼 *Формат:* ${data.format}\n`;
        if (data.message) message += `📝 *Запрос:* ${data.message}\n`;
        message += `\n⏰ *Дата:* ${new Date().toLocaleString('ru-RU')}`;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' })
        });
    } catch (error) {
        console.error('Ошибка отправки заявки:', error);
        throw error;
    }
}

function calculateTestResult(data) {
    let totalScore = 0;
    const testType = data.test_type;
    
    const scoreMap = {
        'frequency': { 'Вообще не хочется': 0, 'Хочется 1 раза в неделю': 1, 'Хочется 1 раз в 3 дня': 2, 'Хочется через день': 3, 'Хочется каждый день': 4, 'Хочется каждый день по много раз': 5 },
        'strength': { 'Легкое желание': 1, 'Среднее желание': 2, 'Сильное желание': 3, 'Очень сильное желание': 4, 'Максимально сильное желание(на столько,что почти невозможно терпеть)': 5 },
        'arousal': { 'Вообще не возбуждает': 0, 'Немного возбуждает': 1, 'Средне возбуждает': 2, 'Сильно возбуждает': 3, 'Очень сильно возбуждает': 4 }
    };
    
    if (testType === 'regular') {
        for (let i = 1; i <= 4; i++) {
            const prefix = `period${i}_`;
            ['frequency', 'strength', 'erected_want', 'erected_not_want', 'non_erected_want', 'non_erected_not_want'].forEach(field => {
                if (data[prefix + field]) totalScore += scoreMap[field][data[prefix + field]] || 0;
            });
        }
        totalScore = Math.round(totalScore / 4);
    } else {
        ['frequency', 'strength', 'erected_want', 'erected_not_want', 'non_erected_want', 'non_erected_not_want'].forEach(field => {
            if (data['menopause_' + field]) totalScore += scoreMap[field][data['menopause_' + field]] || 0;
        });
    }
    
    let level, description;
    if (testType === 'regular') {
        if (totalScore <= 8) { level = 'Низкое либидо'; description = 'Ваше либидо находится на низком уровне...'; }
        else if (totalScore <= 16) { level = 'Среднее либидо'; description = 'У вас средний уровень либидо...'; }
        else if (totalScore <= 24) { level = 'Высокое либидо'; description = 'Поздравляем! У вас высокий уровень либидо...'; }
        else { level = 'Очень высокое либидо'; description = 'У вас очень высокий уровень либидо!...'; }
    } else {
        if (totalScore <= 6) { level = 'Низкое либидо в менопаузе'; description = 'В период менопаузы снижение либидо...'; }
        else if (totalScore <= 12) { level = 'Среднее либидо в менопаузе'; description = 'У вас сохраняется умеренный уровень либидо...'; }
        else if (totalScore <= 18) { level = 'Высокое либидо в менопаузе'; description = 'Поздравляем! Несмотря на менопаузу...'; }
        else { level = 'Очень высокое либидо в менопаузе'; description = 'У вас исключительно высокий уровень либидо...'; }
    }
    
    return { level, description, score: totalScore, testType };
}

function showTestResult(result) {
    const resultLevel = document.getElementById('resultLevel');
    const resultDescription = document.getElementById('resultDescription');
    
    if (result.level.includes('Низкое')) resultLevel.className = 'result-level level-low';
    else if (result.level.includes('Среднее')) resultLevel.className = 'result-level level-medium';
    else if (result.level.includes('Высокое')) resultLevel.className = 'result-level level-high';
    else resultLevel.className = 'result-level level-very-high';
    
    resultLevel.textContent = result.level;
    resultDescription.textContent = result.description;
    showResultSection();
    scrollToTop();
}

// Навигация по секциям
function showRegistrationSection() { hideAllSections(); document.getElementById('registration').classList.remove('section-hidden'); scrollToTop(); }
function showTestSection() { hideAllSections(); document.getElementById('test').classList.remove('section-hidden'); currentStep = 1; updateProgress(); scrollToTop(); }
function showResultSection() { hideAllSections(); document.getElementById('result').classList.remove('section-hidden'); scrollToTop(); }
function showAboutSection() { hideAllSections(); document.getElementById('about').classList.remove('section-hidden'); scrollToTop(); }
function showPowerSection() { hideAllSections(); document.getElementById('power').classList.remove('section-hidden'); scrollToTop(); }
function showServicesSection() { hideAllSections(); document.getElementById('services').classList.remove('section-hidden'); scrollToTop(); }
function showProcessSection() { hideAllSections(); document.getElementById('process').classList.remove('section-hidden'); scrollToTop(); }
function showAwakeningSection() { hideAllSections(); document.getElementById('awakening').classList.remove('section-hidden'); scrollToTop(); }
function showContactsSection() { hideAllSections(); document.getElementById('contacts').classList.remove('section-hidden'); scrollToTop(); }

function hideAllSections() {
    document.querySelectorAll('section').forEach(section => section.classList.add('section-hidden'));
}

// Уведомления
function showSuccessMessage(text) { showNotification(text, 'success'); }
function showErrorMessage(text) { showNotification(text, 'error'); }
function showInfoMessage(text) { showNotification(text, 'info'); }

function showNotification(text, type) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i> ${text}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) notification.parentNode.removeChild(notification);
    }, 5000);
}

// Добавление CSS для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 12px;
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        max-width: 350px;
        color: white;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
    }
    .notification.success { background: linear-gradient(135deg, #4CAF50, #45a049); }
    .notification.error { background: linear-gradient(135deg, #dc3545, #e83e8c); }
    .notification.info { background: linear-gradient(135deg, #2196F3, #1976D2); }
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(notificationStyles);

console.log('🎯 Основной скрипт полностью загружен и готов к работе!');
