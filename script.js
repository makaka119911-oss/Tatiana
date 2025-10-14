// Formspree endpoints - ОБНОВЛЕНО
const FORMSPREE_BOOKING = 'https://formspree.io/f/mblzyavy';
const FORMSPREE_TEST = 'https://formspree.io/f/xwprbndl';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт загружен');

    // Проверка статуса теста
    checkTestCompletion();

    // Переключение мобильного меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Плавный скроллинг с учётом фиксированной шапки
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            // Закрываем мобильное меню после клика
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }

            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                const header = document.querySelector('header');
                const headerOffset = header ? header.offsetHeight : 0;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Показ/скрытие поля для сезонных изменений
    const seasonalRadio = document.querySelectorAll('input[name="seasonal_dependency"]');
    const seasonalDescription = document.getElementById('seasonalDescription');

    if (seasonalRadio.length > 0 && seasonalDescription) {
        seasonalRadio.forEach(radio => {
            radio.addEventListener('change', function() {
                const shouldShow = this.value === 'Да';
                seasonalDescription.style.display = shouldShow ? 'block' : 'none';
            });
        });
    }

    // Запись на консультацию
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (localStorage.getItem('testCompleted') !== 'true') {
                const testRequiredMessage = document.getElementById('testRequiredMessage');
                if (testRequiredMessage) {
                    testRequiredMessage.style.display = 'block';
                    testRequiredMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            submitForm(this, FORMSPREE_BOOKING, '✅ Заявка отправлена! Я свяжусь с вами в течение 24 часов.', false);
        });
    }

    // Форма теста
    const testForm = document.getElementById('libidoTestForm');
    if (testForm) {
        testForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateTestForm(this)) {
                showErrorMessage('❌ Пожалуйста, заполните все обязательные поля');
                return;
            }
            submitForm(this, FORMSPREE_TEST, '✅ Анкета отправлена! Спасибо за ваши ответы. Я свяжусь с вами для обсуждения результатов.', true);
        });
    }

    // Синхронизация мобильных полей
    document.addEventListener('change', function(e) {
        if (e.target.name && e.target.name.includes('_mobile')) {
            const mainFieldName = e.target.name.replace('_mobile', '');
            const mainField = document.querySelector(`[name="${mainFieldName}"]`);
            if (mainField) mainField.value = e.target.value;
        }
        if (e.target.name && !e.target.name.includes('_mobile')) {
            const mobileFieldName = e.target.name + '_mobile';
            const mobileField = document.querySelector(`[name="${mobileFieldName}"]`);
            if (mobileField) mobileField.value = e.target.value;
        }
    });

    // Адаптация таблиц для мобильных
    function adaptTablesForMobile() {
        const isMobile = window.innerWidth <= 768;
        document.querySelectorAll('.period-table').forEach(table => {
            table.style.display = isMobile ? 'none' : 'table';
        });
        document.querySelectorAll('.mobile-period-card').forEach(card => {
            card.style.display = isMobile ? 'block' : 'none';
        });
    }
    window.addEventListener('load', adaptTablesForMobile);
    window.addEventListener('resize', adaptTablesForMobile);

    // Анимации появления секций
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

// --- Вспомогательные функции ---

// Создание текста-результата теста
function createTestSummary(form) {
    let summary = "РЕЗУЛЬТАТЫ ТЕСТА ЛИБИДО\n\n==============================\n\n";
    const generalFrequency = form.querySelector('input[name="general_frequency"]:checked');
    const generalStrength = form.querySelector('input[name="general_strength"]:checked');
    if (generalFrequency) summary += `ОБЩАЯ ЧАСТОТА: ${generalFrequency.value}\n`;
    if (generalStrength) summary += `ОБЩАЯ СИЛА ЖЕЛАНИЯ: ${generalStrength.value}\n`;
    summary += "\n--- ПО ПЕРИОДАМ ЦИКЛА ---\n\n";
    const periods = [
        { name: "От конца месячных до овуляции", prefix: "period1" },
        { name: "В период овуляции", prefix: "period2" },
        { name: "От конца овуляции до начала месячных", prefix: "period3" },
        { name: "В период месячных", prefix: "period4" }
    ];
    periods.forEach(p => {
        summary += `ПЕРИОД: ${p.name}\n`;
        const f = form.querySelector(`select[name="${p.prefix}_frequency"]`);
        const s = form.querySelector(`select[name="${p.prefix}_strength"]`);
        const ed = form.querySelector(`select[name="${p.prefix}_erected_desire"]`);
        const end = form.querySelector(`select[name="${p.prefix}_erected_no_desire"]`);
        if (f && f.value) summary += `  Частота: ${f.value}\n`;
        if (s && s.value) summary += `  Сила: ${s.value}\n`;
        if (ed && ed.value) summary += `  Возбуждение (дни желания): ${ed.value}\n`;
        if (end && end.value) summary += `  Возбуждение (дни без желания): ${end.value}\n`;
        summary += "\n";
    });
    const seasonal = form.querySelector('input[name="seasonal_dependency"]:checked');
    if (seasonal) {
        summary += `СЕЗОННАЯ ЗАВИСИМОСТЬ: ${seasonal.value}\n`;
        const seasonalText = form.querySelector('textarea[name="seasonal_changes"]');
        if (seasonalText && seasonalText.value) summary += `ОПИСАНИЕ: ${seasonalText.value}\n`;
    }
    summary += "==============================\nДата заполнения: " + new Date().toLocaleString('ru-RU');
    return summary;
}

// Универсальная отправка формы
async function submitForm(form, endpoint, successMessage, isTest = false) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    submitBtn.disabled = true;
    try {
        if (isTest) {
            const summaryField = document.getElementById('readableResults');
            if (summaryField) summaryField.value = createTestSummary(form);
        }
        const formData = new FormData(form);
        formData.append('timestamp', new Date().toLocaleString('ru-RU'));
        const response = await fetch(endpoint, {
            method: 'POST', body: formData, headers: { 'Accept': 'application/json' }
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || 'Ошибка на сервере');
        showSuccessMessage(successMessage);
        if (isTest) {
            localStorage.setItem('testCompleted', 'true');
            showTestCompletionMessage();
            checkTestCompletion();
        }
        form.reset();
        const seasonalDescription = document.getElementById('seasonalDescription');
        if (seasonalDescription) seasonalDescription.style.display = 'none';
        document.querySelectorAll('input[name="seasonal_dependency"]').forEach(r => r.checked = false);
    } catch (error) {
        console.error('Ошибка отправки формы:', error);
        showErrorMessage('❌ Ошибка отправки. Позвоните: +7 (905) 595-99-96');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Уведомления
function showSuccessMessage(message) {
    const el = document.createElement('div');
    el.className = 'notification success';
    el.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
}
function showErrorMessage(message) {
    const el = document.createElement('div');
    el.className = 'notification error';
    el.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 8000);
}

// Валидация теста
function validateTestForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        let fieldValid = true;
        if (field.type === 'radio' || field.type === 'checkbox') {
            const groupName = field.name;
            if (!form.querySelector(`input[name="${groupName}"]:checked`)) {
                fieldValid = false;
            }
        } else if (!field.value.trim()) {
            fieldValid = false;
        }

        if (!fieldValid) {
            isValid = false;
            highlightError(field);
        }
    });
    return isValid;
}

function highlightError(element) {
    const formGroup = element.closest('.question-block, .options-grid, .form-group');
    if (formGroup) {
        formGroup.classList.add('error-highlight');
        formGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => formGroup.classList.remove('error-highlight'), 3000);
    }
}

// Управление состоянием прохождения теста
function checkTestCompletion() {
    const testCompleted = localStorage.getItem('testCompleted') === 'true';
    const testRequiredMessage = document.getElementById('testRequiredMessage');
    const bookingSubmitBtn = document.getElementById('bookingSubmitBtn');
    if (testRequiredMessage) testRequiredMessage.style.display = testCompleted ? 'none' : 'block';
    if (bookingSubmitBtn) {
        bookingSubmitBtn.disabled = !testCompleted;
        bookingSubmitBtn.title = testCompleted ? '' : 'Сначала пройдите тест либидо';
    }
}

function showTestCompletionMessage() {
    const message = document.getElementById('testCompletionMessage');
    if (message) {
        message.style.display = 'block';
        message.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

