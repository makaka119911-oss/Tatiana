// Конфигурация Telegram
const TELEGRAM_BOT_TOKEN = '8402206062:AAEJim1GkriKqY_o1mOo0YWSWQDdw5Qy2h0';
const TELEGRAM_CHAT_ID = '846572018';

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
            submitBookingForm(this, '✅ Заявка отправлена! Я свяжусь с вами в течение 24 часов.');
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
            submitTestForm(this, '✅ Анкета отправлена! Спасибо за ваши ответы. Я свяжусь с вами для обсуждения результатов.');
        });
    }

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

// Отправка формы теста в Telegram
async function submitTestForm(form, successMessage) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    submitBtn.disabled = true;
    
    try {
        // Создаем читаемую сводку
        const summary = createTestSummary(form);
        
        // Форматируем для Telegram с эмодзи и разметкой
        let telegramMessage = `📊 *Новая анкета теста либидо*\n\n`;
        telegramMessage += summary.replace(/\n/g, '\n').replace(/\*\*/g, '*');
        
        // Отправляем в Telegram
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();
        
        if (!response.ok || !result.ok) {
            throw new Error(result.description || 'Ошибка отправки в Telegram');
        }

        showSuccessMessage(successMessage);
        
        // Устанавливаем флаг прохождения теста
        localStorage.setItem('testCompleted', 'true');
        showTestCompletionMessage();
        checkTestCompletion();
        
        form.reset();
        
        // Сбрасываем сезонное описание
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

// Отправка формы записи в Telegram
async function submitBookingForm(form, successMessage) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    submitBtn.disabled = true;
    
    try {
        // Собираем данные формы
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Форматируем сообщение для записи
        let telegramMessage = `📅 *Новая запись на консультацию!*\n\n`;
        telegramMessage += `*Имя:* ${data.name || 'Не указано'}\n`;
        telegramMessage += `*Контакты:* ${data.contact || 'Не указано'}\n`;
        telegramMessage += `*Email:* ${data.email || 'Не указан'}\n`;
        telegramMessage += `*Формат работы:* ${data.service || 'Не указан'}\n`;
        if (data.message) {
            telegramMessage += `*Сообщение:* ${data.message}\n`;
        }
        telegramMessage += `\n*Дата заявки:* ${new Date().toLocaleString('ru-RU')}`;

        // Отправляем в Telegram
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();
        
        if (!response.ok || !result.ok) {
            throw new Error(result.description || 'Ошибка отправки в Telegram');
        }

        showSuccessMessage(successMessage);
        form.reset();
        
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
    el.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
    `;
    el.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
}

function showErrorMessage(message) {
    const el = document.createElement('div');
    el.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #dc3545, #e83e8c);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
    `;
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
        formGroup.style.border = '2px solid #e74c3c';
        formGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => formGroup.style.border = '', 3000);
    }
}

// Управление состоянием прохождения теста
function checkTestCompletion() {
    const testCompleted = localStorage.getItem('testCompleted') === 'true';
    const bookingForm = document.getElementById('bookingForm');
    const testRequiredMessage = document.getElementById('testRequiredMessage');
    
    if (bookingForm) {
        if (!testCompleted) {
            bookingForm.style.display = 'none';
            if (testRequiredMessage) {
                testRequiredMessage.style.display = 'block';
            }
        } else {
            bookingForm.style.display = 'block';
            if (testRequiredMessage) {
                testRequiredMessage.style.display = 'none';
            }
        }
    }
}

function showTestCompletionMessage() {
    const message = document.getElementById('testCompletionMessage');
    if (message) {
        message.style.display = 'block';
        message.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Добавляем CSS для анимации
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);

