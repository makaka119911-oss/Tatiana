# JavaScript код (script.js)

```javascript
// Конфигурация Telegram
const TELEGRAM_BOT_TOKEN = '8402206062:AAEJim1GkriKqY_o1mOo0YWSWQDdw5Qy2h0';
const TELEGRAM_CHAT_ID = '-1002313355102';

// Глобальные переменные
let userPhoto = null;
let registrationData = {};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт загружен');

    // Инициализация компонентов
    initMobileMenu();
    initSmoothScroll();
    initBackToTop();
    initPhotoUpload();
    initTestTypeSwitch();
    initSeasonalQuestions();

    // Обработка кнопок регистрации
    document.querySelectorAll('.registration-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showRegistrationSection();
        });
    });

    // Обработка формы регистрации
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistrationSubmit);
    }

    // Обработка формы теста
    const testForm = document.getElementById('libidoTestForm');
    if (testForm) {
        testForm.addEventListener('submit', handleTestSubmit);
    }

    // Обработка кнопки "Вернуться к тесту"
    const backToTestBtn = document.getElementById('backToTest');
    if (backToTestBtn) {
        backToTestBtn.addEventListener('click', function() {
            document.getElementById('result').classList.add('section-hidden');
            document.getElementById('test').classList.remove('section-hidden');
            scrollToSection('test');
        });
    }

    // Обработка кнопки "Записаться на консультацию"
    const showConsultBtn = document.getElementById('showConsultationForm');
    if (showConsultBtn) {
        showConsultBtn.addEventListener('click', function() {
            const consultSection = document.getElementById('consultationFormSection');
            if (consultSection.style.display === 'none') {
                consultSection.style.display = 'block';
                this.innerHTML = '<i class="fas fa-times"></i> Скрыть форму';
            } else {
                consultSection.style.display = 'none';
                this.innerHTML = '<i class="fas fa-calendar-check"></i> Записаться на консультацию';
            }
        });
    }

    // Обработка формы консультации
    const consultForm = document.getElementById('consultationForm');
    if (consultForm) {
        consultForm.addEventListener('submit', handleConsultationSubmit);
    }

    // Проверяем статус регистрации
    checkRegistrationStatus();
});

// ===== MOBILE MENU =====
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    const menuOverlay = document.getElementById('menuOverlay');
    const body = document.body;

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            
            if (navLinks.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });

        menuOverlay.addEventListener('click', function() {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            menuOverlay.classList.remove('active');
            body.style.overflow = '';
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                menuOverlay.classList.remove('active');
                body.style.overflow = '';
            });
        });
    }
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#registration' || href === '#test') {
                return;
            }
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                scrollToSection(href.substring(1));
            }
        });
    });
}

function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== BACK TO TOP =====
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== PHOTO UPLOAD =====
function initPhotoUpload() {
    const photoInput = document.getElementById('photo');
    const previewImage = document.getElementById('previewImage');
    const photoPreview = document.getElementById('photoPreview');

    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                // Проверка размера файла (макс 10 МБ)
                if (file.size > 10 * 1024 * 1024) {
                    showErrorMessage('Размер файла не должен превышать 10 МБ');
                    photoInput.value = '';
                    return;
                }

                // Проверка типа файла
                if (!file.type.match('image.*')) {
                    showErrorMessage('Пожалуйста, выберите изображение');
                    photoInput.value = '';
                    return;
                }

                // Сохраняем файл
                userPhoto = file;

                // Показываем предпросмотр
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    photoPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function removePhoto() {
    userPhoto = null;
    document.getElementById('photo').value = '';
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('previewImage').src = '';
}

// ===== TEST TYPE SWITCH =====
function initTestTypeSwitch() {
    const regularTestRadio = document.getElementById('regular_test');
    const menopauseTestRadio = document.getElementById('menopause_test');
    
    if (regularTestRadio && menopauseTestRadio) {
        regularTestRadio.addEventListener('change', toggleTestSections);
        menopauseTestRadio.addEventListener('change', toggleTestSections);
    }
}

function toggleTestSections() {
    const regularSection = document.getElementById('regularTestSection');
    const menopauseSection = document.getElementById('menopauseTestSection');
    const isRegular = document.getElementById('regular_test').checked;

    if (isRegular) {
        regularSection.style.display = 'block';
        menopauseSection.style.display = 'none';
        
        // Удаляем required у полей менопаузы
        menopauseSection.querySelectorAll('input[type="radio"]').forEach(input => {
            input.removeAttribute('required');
        });
        
        // Добавляем required к полям обычного теста
        regularSection.querySelectorAll('input[type="radio"][required]').forEach(input => {
            input.setAttribute('required', 'required');
        });
    } else {
        regularSection.style.display = 'none';
        menopauseSection.style.display = 'block';
        
        // Удаляем required у полей обычного теста
        regularSection.querySelectorAll('input[type="radio"]').forEach(input => {
            input.removeAttribute('required');
        });
        
        // Добавляем required к полям менопаузы
        menopauseSection.querySelectorAll('input[type="radio"]').forEach(input => {
            if (!input.name.includes('seasonal')) {
                input.setAttribute('required', 'required');
            }
        });
    }
}

// ===== SEASONAL QUESTIONS =====
function initSeasonalQuestions() {
    // Для обычного теста
    const seasonalRadios = document.querySelectorAll('input[name="seasonal"]');
    seasonalRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const description = document.getElementById('seasonalDescription');
            if (this.value === 'yes') {
                description.style.display = 'block';
            } else {
                description.style.display = 'none';
            }
        });
    });

    // Для теста менопаузы
    const mSeasonalRadios = document.querySelectorAll('input[name="m_seasonal"]');
    mSeasonalRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const description = document.getElementById('menopauseSeasonalDescription');
            if (this.value === 'yes') {
                description.style.display = 'block';
            } else {
                description.style.display = 'none';
            }
        });
    });
}

// ===== SECTION NAVIGATION =====
function checkRegistrationStatus() {
    const registrationCompleted = localStorage.getItem('registrationCompleted');
    if (registrationCompleted === 'true') {
        showTestSection();
    }
}

function showRegistrationSection() {
    document.getElementById('registration').classList.remove('section-hidden');
    document.getElementById('test').classList.add('section-hidden');
    document.getElementById('result').classList.add('section-hidden');
    scrollToSection('registration');
}

function showTestSection() {
    document.getElementById('registration').classList.add('section-hidden');
    document.getElementById('test').classList.remove('section-hidden');
    document.getElementById('result').classList.add('section-hidden');
    scrollToSection('test');
}

function showResultSection() {
    document.getElementById('registration').classList.add('section-hidden');
    document.getElementById('test').classList.add('section-hidden');
    document.getElementById('result').classList.remove('section-hidden');
    scrollToSection('result');
}

// ===== FORM VALIDATION =====
function validateRegistrationForm(form) {
    let isValid = true;
    
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (field.type === 'file') {
            if (!userPhoto) {
                isValid = false;
                field.classList.add('error');
                const errorMsg = document.getElementById('photoError');
                if (errorMsg) errorMsg.style.display = 'block';
            } else {
                field.classList.remove('error');
                const errorMsg = document.getElementById('photoError');
                if (errorMsg) errorMsg.style.display = 'none';
            }
        } else if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

function validateTestForm() {
    const testType = document.querySelector('input[name="test_type"]:checked').value;
    let isValid = true;
    
    if (testType === 'regular') {
        // Проверяем все 4 периода × 6 вопросов
        for (let p = 1; p <= 4; p++) {
            const questions = ['frequency', 'strength', 'erect_yes', 'erect_no', 'soft_yes', 'soft_no'];
            for (let q of questions) {
                const name = `p${p}_${q}`;
                const checked = document.querySelector(`input[name="${name}"]:checked`);
                if (!checked) {
                    isValid = false;
                    console.log(`Missing answer for ${name}`);
                }
            }
        }
        
        // Проверяем сезонный вопрос
        const seasonal = document.querySelector('input[name="seasonal"]:checked');
        if (!seasonal) {
            isValid = false;
        }
    } else {
        // Проверяем вопросы менопаузы
        const questions = ['frequency', 'strength', 'erect_yes', 'erect_no', 'soft_yes', 'soft_no'];
        for (let q of questions) {
            const name = `m_${q}`;
            const checked = document.querySelector(`input[name="${name}"]:checked`);
            if (!checked) {
                isValid = false;
                console.log(`Missing answer for ${name}`);
            }
        }
    }
    
    if (!isValid) {
        showErrorMessage('Пожалуйста, ответьте на все вопросы перед отправкой теста');
    }
    
    return isValid;
}

// ===== REGISTRATION FORM SUBMIT =====
async function handleRegistrationSubmit(e) {
    e.preventDefault();
    
    if (!validateRegistrationForm(this)) {
        showErrorMessage('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
        submitBtn.disabled = true;
        
        const formData = new FormData(this);
        
        // Сохраняем данные для отправки с результатами теста
        registrationData = {
            lastName: formData.get('lastName'),
            firstName: formData.get('firstName'),
            age: formData.get('age'),
            phone: formData.get('phone'),
            telegram: formData.get('telegram')
        };
        
        // Отправляем регистрацию в Telegram
        await sendRegistrationToTelegram(registrationData, userPhoto);
        
        showSuccessMessage('✅ Регистрация прошла успешно! Теперь вы можете пройти тест.');
        
        // Сохраняем статус регистрации
        localStorage.setItem('registrationCompleted', 'true');
        
        // Показываем тест
        setTimeout(() => {
            showTestSection();
        }, 1500);
        
    } catch (error) {
        console.error('Ошибка отправки формы:', error);
        showErrorMessage('❌ Ошибка регистрации. Пожалуйста, попробуйте еще раз.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ===== SEND REGISTRATION TO TELEGRAM =====
async function sendRegistrationToTelegram(data, photo) {
    try {
        // Сначала отправляем текстовое сообщение
        let message = `🌟 *НОВАЯ РЕГИСТРАЦИЯ* 🌟\\n\\n`;
        message += `👤 *Контактная информация:*\\n`;
        message += `   └ *Фамилия:* ${data.lastName}\\n`;
        message += `   └ *Имя:* ${data.firstName}\\n`;
        message += `   └ *Возраст:* ${data.age}\\n`;
        message += `   └ *Телефон:* ${data.phone}\\n`;
        message += `   └ *Telegram:* ${data.telegram}\\n`;
        message += `\\n⏰ *Дата регистрации:* ${new Date().toLocaleString('ru-RU')}`;

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

        // Затем отправляем фото
        if (photo) {
            await sendPhotoToTelegram(photo, `Фото: ${data.firstName} ${data.lastName}`);
        }

        console.log('✅ Регистрация успешно отправлена в Telegram');
        
    } catch (error) {
        console.error('Ошибка отправки регистрации:', error);
        throw error;
    }
}

// ===== SEND PHOTO TO TELEGRAM =====
async function sendPhotoToTelegram(photoFile, caption) {
    try {
        const formData = new FormData();
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        formData.append('photo', photoFile);
        formData.append('caption', caption);

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (!response.ok || !result.ok) {
            throw new Error(result.description || 'Ошибка отправки фото');
        }

        console.log('✅ Фото успешно отправлено в Telegram');
        
    } catch (error) {
        console.error('Ошибка отправки фото:', error);
        throw error;
    }
}

// ===== TEST FORM SUBMIT =====
async function handleTestSubmit(e) {
    e.preventDefault();
    
    if (!validateTestForm()) {
        return;
    }
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обработка...';
        submitBtn.disabled = true;
        
        // Собираем данные теста
        const testData = collectTestData();
        
        // Подсчитываем результат
        const result = calculateTestResult(testData);
        
        // Показываем результат
        displayTestResult(result);
        
        // Отправляем результаты в Telegram
        await sendTestResultsToTelegram(testData, result);
        
        // Показываем секцию с результатами
        showResultSection();
        
    } catch (error) {
        console.error('Ошибка обработки теста:', error);
        showErrorMessage('❌ Ошибка обработки результатов. Пожалуйста, попробуйте еще раз.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ===== COLLECT TEST DATA =====
function collectTestData() {
    const testType = document.querySelector('input[name="test_type"]:checked').value;
    const data = {
        testType: testType,
        answers: {}
    };
    
    if (testType === 'regular') {
        // Собираем ответы для обычного теста
        for (let p = 1; p <= 4; p++) {
            const questions = ['frequency', 'strength', 'erect_yes', 'erect_no', 'soft_yes', 'soft_no'];
            for (let q of questions) {
                const name = `p${p}_${q}`;
                const checked = document.querySelector(`input[name="${name}"]:checked`);
                if (checked) {
                    data.answers[name] = parseInt(checked.value);
                }
            }
        }
        
        // Сезонный вопрос
        const seasonal = document.querySelector('input[name="seasonal"]:checked');
        data.answers.seasonal = seasonal ? seasonal.value : 'no';
        
        if (seasonal && seasonal.value === 'yes') {
            const seasonalText = document.getElementById('seasonalText');
            data.answers.seasonalDescription = seasonalText ? seasonalText.value : '';
        }
    } else {
        // Собираем ответы для теста менопаузы
        const questions = ['frequency', 'strength', 'erect_yes', 'erect_no', 'soft_yes', 'soft_no'];
        for (let q of questions) {
            const name = `m_${q}`;
            const checked = document.querySelector(`input[name="${name}"]:checked`);
            if (checked) {
                data.answers[name] = parseInt(checked.value);
            }
        }
        
        // Сезонный вопрос
        const seasonal = document.querySelector('input[name="m_seasonal"]:checked');
        data.answers.seasonal = seasonal ? seasonal.value : 'no';
        
        if (seasonal && seasonal.value === 'yes') {
            const seasonalText = document.getElementById('menopauseSeasonalText');
            data.answers.seasonalDescription = seasonalText ? seasonalText.value : '';
        }
    }
    
    return data;
}

// ===== CALCULATE TEST RESULT =====
function calculateTestResult(testData) {
    let totalScore = 0;
    let maxScore = 0;
    
    if (testData.testType === 'regular') {
        // Подсчитываем баллы для обычного теста
        // 4 периода × (частота + сила + 4 вопроса возбуждения)
        for (let p = 1; p <= 4; p++) {
            const freq = testData.answers[`p${p}_frequency`] || 0;
            const strength = testData.answers[`p${p}_strength`] || 0;
            const erectYes = testData.answers[`p${p}_erect_yes`] || 0;
            const erectNo = testData.answers[`p${p}_erect_no`] || 0;
            const softYes = testData.answers[`p${p}_soft_yes`] || 0;
            const softNo = testData.answers[`p${p}_soft_no`] || 0;
            
            totalScore += freq + strength + erectYes + erectNo + softYes + softNo;
        }
        
        // Максимальный балл: 4 периода × (5 + 5 + 4 + 4 + 4 + 4) = 104
        maxScore = 104;
    } else {
        // Подсчитываем баллы для теста менопаузы
        const freq = testData.answers.m_frequency || 0;
        const strength = testData.answers.m_strength || 0;
        const erectYes = testData.answers.m_erect_yes || 0;
        const erectNo = testData.answers.m_erect_no || 0;
        const softYes = testData.answers.m_soft_yes || 0;
        const softNo = testData.answers.m_soft_no || 0;
        
        totalScore = freq + strength + erectYes + erectNo + softYes + softNo;
        
        // Максимальный балл: 5 + 5 + 4 + 4 + 4 + 4 = 26
        maxScore = 26;
    }
    
    // Вычисляем процент
    const percentage = (totalScore / maxScore) * 100;
    
    // Определяем уровень либидо
    let level, description, className;
    
    if (testData.testType === 'regular') {
        if (percentage < 25) {
            level = 'Слабое либидо';
            description = 'Ваше либидо находится на низком уровне. Это может быть связано с физиологическими или психологическими факторами. Рекомендуется консультация для выявления причин и подбора индивидуальной программы восстановления.';
            className = 'level-low';
        } else if (percentage < 50) {
            level = 'Среднее либидо';
            description = 'У вас средний уровень либидо. Есть хороший потенциал для усиления сексуальной энергии и достижения более гармоничного состояния. Работа с психологом-сексологом поможет раскрыть вашу женскую силу.';
            className = 'level-medium';
        } else if (percentage < 75) {
            level = 'Высокое либидо';
            description = 'Поздравляем! У вас высокий уровень либидо. Ваша сексуальная энергия находится в хорошем состоянии. Консультация поможет поддерживать этот уровень и гармонизировать отношения с партнером.';
            className = 'level-high';
        } else {
            level = 'Очень высокое либидо';
            description = 'У вас очень высокий уровень сексуальной энергии! Это прекрасное состояние, которое можно направить на творчество, самореализацию и гармоничные отношения. Я помогу вам управлять этой силой для достижения максимального благополучия.';
            className = 'level-very-high';
        }
    } else {
        if (percentage < 25) {
            level = 'Слабое либидо в менопаузе';
            description = 'В период менопаузы снижение либидо является распространенным явлением, связанным с гормональными изменениями. Существуют эффективные методы восстановления сексуальной энергии даже в этот период жизни.';
            className = 'level-low';
        } else if (percentage < 50) {
            level = 'Среднее либидо в менопаузе';
            description = 'У вас сохраняется умеренный уровень либидо несмотря на менопаузу. Это хороший показатель! Есть возможности для дальнейшего усиления сексуальной энергии и повышения качества жизни.';
            className = 'level-medium';
        } else if (percentage < 75) {
            level = 'Высокое либидо в менопаузе';
            description = 'Поздравляем! Несмотря на менопаузу, у вас сохраняется высокий уровень либидо. Это говорит о вашей гормональной стабильности и эмоциональном благополучии.';
            className = 'level-high';
        } else {
            level = 'Очень высокое либидо в менопаузе';
            description = 'Удивительный результат! У вас очень высокий уровень сексуальной энергии в период менопаузы. Это редкий и ценный дар, который можно использовать для полноценной и счастливой жизни.';
            className = 'level-very-high';
        }
    }
    
    return {
        score: totalScore,
        maxScore: maxScore,
        percentage: percentage.toFixed(1),
        level: level,
        description: description,
        className: className
    };
}

// ===== DISPLAY TEST RESULT =====
function displayTestResult(result) {
    const resultLevel = document.getElementById('resultLevel');
    const resultDescription = document.getElementById('resultDescription');
    
    resultLevel.className = `result-level ${result.className}`;
    resultLevel.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${result.level}</div>
        <div style="font-size: 1.2rem; opacity: 0.9;">Баллы: ${result.score} из ${result.maxScore} (${result.percentage}%)</div>
    `;
    
    resultDescription.textContent = result.description;
}

// ===== SEND TEST RESULTS TO TELEGRAM =====
async function sendTestResultsToTelegram(testData, result) {
    try {
        let message = `📊 *НОВЫЙ РЕЗУЛЬТАТ ТЕСТА ЛИБИДО* 📊\\n\\n`;
        
        if (registrationData.firstName) {
            message += `👤 *Пользователь:* ${registrationData.firstName} ${registrationData.lastName}\\n`;
            message += `📱 *Telegram:* ${registrationData.telegram}\\n\\n`;
        }
        
        message += `🔍 *Тип теста:* ${testData.testType === 'regular' ? 'Обычный' : 'Менопауза'}\\n`;
        message += `📈 *Уровень либидо:* ${result.level}\\n`;
        message += `⭐ *Баллы:* ${result.score} из ${result.maxScore} (${result.percentage}%)\\n\\n`;
        
        message += `📝 *Детали ответов:*\\n`;
        
        if (testData.testType === 'regular') {
            for (let p = 1; p <= 4; p++) {
                message += `\\n*Период ${p}:*\\n`;
                message += `   └ Частота: ${testData.answers[`p${p}_frequency`]}\\n`;
                message += `   └ Сила: ${testData.answers[`p${p}_strength`]}\\n`;
                message += `   └ Эрегир. (да): ${testData.answers[`p${p}_erect_yes`]}\\n`;
                message += `   └ Эрегир. (нет): ${testData.answers[`p${p}_erect_no`]}\\n`;
                message += `   └ Не эрегир. (да): ${testData.answers[`p${p}_soft_yes`]}\\n`;
                message += `   └ Не эрегир. (нет): ${testData.answers[`p${p}_soft_no`]}\\n`;
            }
        } else {
            message += `   └ Частота: ${testData.answers.m_frequency}\\n`;
            message += `   └ Сила: ${testData.answers.m_strength}\\n`;
            message += `   └ Эрегир. (да): ${testData.answers.m_erect_yes}\\n`;
            message += `   └ Эрегир. (нет): ${testData.answers.m_erect_no}\\n`;
            message += `   └ Не эрегир. (да): ${testData.answers.m_soft_yes}\\n`;
            message += `   └ Не эрегир. (нет): ${testData.answers.m_soft_no}\\n`;
        }
        
        message += `\\n🌦️ *Сезонная зависимость:* ${testData.answers.seasonal === 'yes' ? 'Да' : 'Нет'}\\n`;
        
        if (testData.answers.seasonal === 'yes' && testData.answers.seasonalDescription) {
            message += `   └ Описание: ${testData.answers.seasonalDescription}\\n`;
        }
        
        message += `\\n⏰ *Дата заполнения:* ${new Date().toLocaleString('ru-RU')}`;

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

// ===== CONSULTATION FORM SUBMIT =====
async function handleConsultationSubmit(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        const formData = new FormData(this);
        const data = {
            name: formData.get('consultName'),
            email: formData.get('consultEmail'),
            format: formData.get('consultFormat'),
            request: formData.get('consultRequest')
        };
        
        await sendConsultationToTelegram(data);
        
        showSuccessMessage('✅ Ваша заявка успешно отправлена! Я свяжусь с вами в ближайшее время.');
        
        this.reset();
        document.getElementById('consultationFormSection').style.display = 'none';
        document.getElementById('showConsultationForm').innerHTML = '<i class="fas fa-calendar-check"></i> Записаться на консультацию';
        
    } catch (error) {
        console.error('Ошибка отправки заявки:', error);
        showErrorMessage('❌ Ошибка отправки заявки. Пожалуйста, попробуйте еще раз.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ===== SEND CONSULTATION TO TELEGRAM =====
async function sendConsultationToTelegram(data) {
    try {
        let message = `📋 *НОВАЯ ЗАЯВКА НА КОНСУЛЬТАЦИЮ* 📋\\n\\n`;
        message += `👤 *Имя:* ${data.name}\\n`;
        message += `📧 *Email:* ${data.email}\\n`;
        message += `💼 *Формат работы:* ${data.format}\\n\\n`;
        message += `📝 *Запрос клиента:*\\n${data.request}\\n\\n`;
        message += `⏰ *Дата заявки:* ${new Date().toLocaleString('ru-RU')}`;

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

// ===== NOTIFICATION HELPERS =====
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `<i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 8000);
}
```

