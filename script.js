// Formspree endpoints - ОБНОВЛЕНО
const FORMSPREE_BOOKING = 'https://formspree.io/f/mblzyavy';
const FORMSPREE_TEST = 'https://formspree.io/f/xwprbndl';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт загружен');

    // Проверяем, пройден ли тест
    checkTestCompletion();

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            if (navLinks) navLinks.classList.remove('active');
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

// Добавьте этот код в существующий JavaScript

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

// Функция для создания читаемого текста из ответов теста
function createTestSummary(form) {
    let summary = "РЕЗУЛЬТАТЫ ТЕСТА ЛИБИДО\n\n";
    summary += "==============================\n\n";
    
    // Собираем общие вопросы
    const generalFrequency = form.querySelector('input[name="general_frequency"]:checked');
    const generalStrength = form.querySelector('input[name="general_strength"]:checked');
    
    if (generalFrequency) {
        summary += `ОБЩАЯ ЧАСТОТА: ${generalFrequency.value}\n`;
    }
    if (generalStrength) {
        summary += `ОБЩАЯ СИЛА ЖЕЛАНИЯ: ${generalStrength.value}\n`;
    }
    
    summary += "\n--- ПО ПЕРИОДАМ ЦИКЛА ---\n\n";
    
    // Собираем ответы по периодам
    const periods = [
        { name: "От конца месячных до овуляции", prefix: "period1" },
        { name: "В период овуляции", prefix: "period2" },
        { name: "От конца овуляции до начала месячных", prefix: "period3" },
        { name: "В период месячных", prefix: "period4" }
    ];
    
    periods.forEach(period => {
        summary += `ПЕРИОД: ${period.name}\n`;
        
        const frequency = form.querySelector(`select[name="${period.prefix}_frequency"]`);
        const strength = form.querySelector(`select[name="${period.prefix}_strength"]`);
        const erectedDesire = form.querySelector(`select[name="${period.prefix}_erected_desire"]`);
        const erectedNoDesire = form.querySelector(`select[name="${period.prefix}_erected_no_desire"]`);
        
        if (frequency && frequency.value) summary += `  Частота: ${frequency.value}\n`;
        if (strength && strength.value) summary += `  Сила: ${strength.value}\n`;
        if (erectedDesire && erectedDesire.value) summary += `  Возбуждение (дни желания): ${erectedDesire.value}\n`;
        if (erectedNoDesire && erectedNoDesire.value) summary += `  Возбуждение (дни без желания): ${erectedNoDesire.value}\n`;
        
        summary += "\n";
    });
    
    // Сезонные особенности
    const seasonal = form.querySelector('input[name="seasonal_dependency"]:checked');
    const seasonalText = form.querySelector('textarea[name="seasonal_changes"]');
    
    if (seasonal) {
        summary += `СЕЗОННАЯ ЗАВИСИМОСТЬ: ${seasonal.value}\n`;
        if (seasonalText && seasonalText.value) {
            summary += `ОПИСАНИЕ: ${seasonalText.value}\n`;
        }
    }
    
    summary += "==============================\n";
    summary += "Дата заполнения: " + new Date().toLocaleString('ru-RU');
    
    return summary;
}

    // Улучшенная функция отправки формы
    async function submitForm(form, endpoint, successMessage, isTest = false) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Показываем загрузку
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        try {
            // Для теста создаем читаемое резюме
            if (isTest) {
                const summary = createTestSummary(form);
                const summaryField = document.getElementById('readableResults');
                if (summaryField) {
                    summaryField.value = summary;
                }
            }
            
            // Создаем FormData
            const formData = new FormData(form);
            
            // Добавляем временную метку
            formData.append('timestamp', new Date().toLocaleString('ru-RU'));
            
            console.log('Отправка данных на Formspree:', endpoint);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (response.ok && result.ok) {
                // Успешная отправка
                showSuccessMessage(successMessage);
                
                // Если это тест, сохраняем факт прохождения
                if (isTest) {
                    localStorage.setItem('testCompleted', 'true');
                    showTestCompletionMessage();
                    checkTestCompletion();
                }
                
                form.reset();
                
                // Сбрасываем дополнительные поля
                if (seasonalDescription) {
                    seasonalDescription.style.display = 'none';
                }
                seasonalRadio.forEach(radio => {
                    radio.checked = false;
                });
                
            } else {
                throw new Error(result.error || 'Ошибка отправки формы');
            }
            
        } catch (error) {
            console.error('Ошибка отправки:', error);
            showErrorMessage('❌ Произошла ошибка при отправке. Пожалуйста, позвоните мне: +7 (905) 595-99-96');
        } finally {
            // Восстанавливаем кнопку
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // Функции показа сообщений
    function showSuccessMessage(message) {
        // Создаем красивое уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i> ${message}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    function showErrorMessage(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> ${message}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Форма записи на консультацию
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Проверяем, пройден ли тест
            if (localStorage.getItem('testCompleted') !== 'true') {
                const testRequiredMessage = document.getElementById('testRequiredMessage');
                if (testRequiredMessage) {
                    testRequiredMessage.style.display = 'block';
                    testRequiredMessage.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
                return;
            }
            
            submitForm(
                this, 
                FORMSPREE_BOOKING, 
                '✅ Заявка отправлена! Я свяжусь с вами в течение 24 часов.',
                false
            );
        });
    }

    // Форма теста
    const testForm = document.getElementById('libidoTestForm');
    if (testForm) {
        testForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Проверяем обязательные поля
            if (!validateTestForm(this)) {
                showErrorMessage('❌ Пожалуйста, заполните все обязательные поля');
                return;
            }
            
            submitForm(
                this, 
                FORMSPREE_TEST, 
                '✅ Анкета отправлена! Спасибо за ваши ответы. Я свяжусь с вами для обсуждения результатов.',
                true
            );
        });
    }

    // Валидация формы теста
    function validateTestForm(form) {
        let isValid = true;
        
        // Проверяем радиокнопки
        for (let i = 1; i <= 3; i++) {
            const radio = form.querySelector(`input[name="question_${i}"]:checked`);
            if (!radio) {
                isValid = false;
                highlightError(form.querySelector(`input[name="question_${i}"]`));
            }
        }
        
        // Проверяем селекты периодов
        const periodFields = ['4a', '4b', '4c', '4d'];
        periodFields.forEach(field => {
            const select = form.querySelector(`select[name="question_${field}"]`) || 
                          form.querySelector(`select[name="question_${field}_mobile"]`);
            if (select && !select.value) {
                isValid = false;
                highlightError(select);
            }
        });
        
        // Проверяем сезонные вопросы
        const q5 = form.querySelector('input[name="question_5"]:checked');
        if (!q5) {
            isValid = false;
            highlightError(form.querySelector('input[name="question_5"]'));
        } else if (q5.value === 'Да') {
            const q6 = form.querySelector('textarea[name="question_6"]')?.value;
            if (!q6 || q6.trim() === '') {
                isValid = false;
                highlightError(form.querySelector('textarea[name="question_6"]'));
            }
        }
        
        return isValid;
    }

    function highlightError(element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.borderColor = '#e74c3c';
        element.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
        
        setTimeout(() => {
            element.style.borderColor = '';
            element.style.boxShadow = '';
        }, 3000);
    }

    // Синхронизация полей
    document.addEventListener('change', function(e) {
        if (e.target.name && e.target.name.includes('_mobile')) {
            const mainFieldName = e.target.name.replace('_mobile', '');
            const mainField = document.querySelector(`[name="${mainFieldName}"]`);
            if (mainField) {
                mainField.value = e.target.value;
            }
        }
        
        if (e.target.name && !e.target.name.includes('_mobile')) {
            const mobileFieldName = e.target.name + '_mobile';
            const mobileField = document.querySelector(`[name="${mobileFieldName}"]`);
            if (mobileField) {
                mobileField.value = e.target.value;
            }
        }
    });

    // Адаптация таблиц
    function adaptTablesForMobile() {
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.period-table').forEach(table => {
                table.style.display = 'none';
            });
            document.querySelectorAll('.mobile-period-card').forEach(card => {
                card.style.display = 'block';
            });
        } else {
            document.querySelectorAll('.period-table').forEach(table => {
                table.style.display = 'table';
            });
            document.querySelectorAll('.mobile-period-card').forEach(card => {
                card.style.display = 'none';
            });
        }
    }

    window.addEventListener('load', adaptTablesForMobile);
    window.addEventListener('resize', adaptTablesForMobile);

    // Анимации
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

    // Функции управления состоянием теста
    function checkTestCompletion() {
        const testCompleted = localStorage.getItem('testCompleted') === 'true';
        const testRequiredMessage = document.getElementById('testRequiredMessage');
        const bookingSubmitBtn = document.getElementById('bookingSubmitBtn');
        
        if (testRequiredMessage) {
            testRequiredMessage.style.display = testCompleted ? 'none' : 'block';
        }
        
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
});
