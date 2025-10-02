// Formspree endpoints
const FORMSPREE_BOOKING = 'https://formspree.io/f/xrbykqya'; // для записи
const FORMSPREE_TEST = 'https://formspree.io/f/xpwyrdyp'; // для теста

// Основная функция инициализации
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

    // Smooth scrolling for navigation links
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

    // Показ/скрытие поля для сезонных изменений
    const seasonalRadio = document.querySelectorAll('input[name="question_5"]');
    const seasonalDescription = document.getElementById('seasonalDescription');
    
    if (seasonalRadio.length > 0 && seasonalDescription) {
        seasonalRadio.forEach(radio => {
            radio.addEventListener('change', function() {
                const shouldShow = this.value === 'Да';
                seasonalDescription.style.display = shouldShow ? 'block' : 'none';
                
                // Делаем текстовое поле обязательным только если выбрано "Да"
                const textarea = seasonalDescription.querySelector('textarea');
                if (textarea) {
                    textarea.required = shouldShow;
                }
            });
        });
    }

    // Валидация форм в реальном времени
    setupFormValidation();

    // Функция для создания читаемого текста результатов теста
    function createTestSummary(form) {
        const timestamp = new Date().toLocaleString('ru-RU');
        let summary = `🎯 РЕЗУЛЬТАТЫ ТЕСТА ЛИБИДО\n`;
        summary += `📅 Дата заполнения: ${timestamp}\n`;
        summary += `========================================\n\n`;
        
        // Контактные данные
        const name = form.querySelector('#clientName')?.value || 'Не указано';
        const contact = form.querySelector('#clientContact')?.value || 'Не указано';
        
        if (name !== 'Не указано' || contact !== 'Не указано') {
            summary += `👤 КОНТАКТНЫЕ ДАННЫЕ:\n`;
            summary += `Имя: ${name}\n`;
            summary += `Контакты: ${contact}\n\n`;
            summary += `========================================\n\n`;
        }
        
        // Собираем ответы на вопросы
        summary += `📊 ОТВЕТЫ НА ВОПРОСЫ:\n\n`;
        
        // Вопрос 1
        const q1 = form.querySelector('input[name="question_1"]:checked');
        if (q1) {
            summary += `1. Как часто в целом хочется секса?\n`;
            summary += `   ✅ ${q1.value}\n\n`;
        }
        
        // Вопрос 2
        const q2 = form.querySelector('input[name="question_2"]:checked');
        if (q2) {
            summary += `2. Сила желания в те дни, когда хочется секса?\n`;
            summary += `   ✅ ${q2.value}\n\n`;
        }
        
        // Вопрос 3
        const q3 = form.querySelector('input[name="question_3"]:checked');
        if (q3) {
            summary += `3. Возбуждает ли вид эрегированного полового члена?\n`;
            summary += `   ✅ ${q3.value}\n\n`;
        }
        
        // Период 1 вопросы
        const q4a = form.querySelector('select[name="question_4a"]')?.value || 
                    form.querySelector('select[name="question_4a_mobile"]')?.value;
        if (q4a && q4a !== '') {
            summary += `4. Период 1 - Без желания - Частота:\n`;
            summary += `   ✅ ${q4a}\n\n`;
        }
        
        const q4b = form.querySelector('select[name="question_4b"]')?.value || 
                    form.querySelector('select[name="question_4b_mobile"]')?.value;
        if (q4b && q4b !== '') {
            summary += `5. Период 1 - С желанием - Сила:\n`;
            summary += `   ✅ ${q4b}\n\n`;
        }
        
        const q4c = form.querySelector('select[name="question_4c"]')?.value || 
                    form.querySelector('select[name="question_4c_mobile"]')?.value;
        if (q4c && q4c !== '') {
            summary += `6. Период 1 - Без желания - Возбуждение:\n`;
            summary += `   ✅ ${q4c}\n\n`;
        }
        
        const q4d = form.querySelector('select[name="question_4d"]')?.value || 
                    form.querySelector('select[name="question_4d_mobile"]')?.value;
        if (q4d && q4d !== '') {
            summary += `7. Период 1 - С желанием - Возбуждение:\n`;
            summary += `   ✅ ${q4d}\n\n`;
        }
        
        // Сезонные особенности
        const q5 = form.querySelector('input[name="question_5"]:checked');
        if (q5) {
            summary += `8. Сезонная зависимость:\n`;
            summary += `   ✅ ${q5.value}\n\n`;
        }
        
        const q6 = form.querySelector('textarea[name="question_6"]')?.value;
        if (q6 && q6.trim() !== '') {
            summary += `9. Сезонные изменения:\n`;
            summary += `   📝 ${q6}\n\n`;
        }
        
        summary += `========================================\n`;
        summary += `💡 РЕКОМЕНДАЦИЯ:\n`;
        summary += `Тест заполнен полностью. Требуется профессиональная консультация.\n`;
        
        return summary;
    }

    // Функция для отправки формы
    async function submitForm(form, endpoint, successMessage, isTest = false) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Проверяем валидность формы
        if (!form.checkValidity()) {
            showFormErrors(form);
            return;
        }
        
        // Для теста создаем читаемое резюме
        if (isTest) {
            const summary = createTestSummary(form);
            const summaryField = document.getElementById('readableResults');
            if (summaryField) {
                summaryField.value = summary;
            }
        }
        
        // Показываем загрузку
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        try {
            // Создаем FormData из формы
            const formData = new FormData(form);
            
            console.log('Отправка данных на:', endpoint);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('Статус ответа:', response.status);
            console.log('Ответ OK:', response.ok);
            
            if (response.ok) {
                // Успешная отправка
                alert(successMessage);
                
                // Если это тест, сохраняем факт прохождения
                if (isTest) {
                    localStorage.setItem('testCompleted', 'true');
                    showTestCompletionMessage();
                    checkTestCompletion();
                }
                
                form.reset();
                
                // Сбрасываем сезонное описание если есть
                if (seasonalDescription) {
                    seasonalDescription.style.display = 'none';
                }
                
                // Сбрасываем выбранные радиокнопки сезонности
                seasonalRadio.forEach(radio => {
                    radio.checked = false;
                });
                
            } else {
                // Получаем текст ошибки для отладки
                const errorText = await response.text();
                console.error('Ошибка Formspree:', errorText);
                throw new Error(`Formspree error: ${response.status} ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('Ошибка отправки:', error);
            alert('❌ Произошла ошибка при отправке. Пожалуйста, позвоните мне: +7 (905) 595-99-96');
        } finally {
            // Восстанавливаем кнопку
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
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
            submitForm(
                this, 
                FORMSPREE_TEST, 
                '✅ Анкета отправлена! Спасибо за ваши ответы. Я свяжусь с вами для обсуждения результатов.',
                true
            );
        });
    }

    // Синхронизация мобильных и десктопных полей
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

    // Адаптация таблиц для мобильных устройств
    function adaptTablesForMobile() {
        if (window.innerWidth <= 768) {
            const tables = document.querySelectorAll('.period-table');
            const mobileCards = document.querySelectorAll('.mobile-period-card');
            
            tables.forEach(table => {
                table.style.display = 'none';
            });
            mobileCards.forEach(card => {
                card.style.display = 'block';
            });
        } else {
            const tables = document.querySelectorAll('.period-table');
            const mobileCards = document.querySelectorAll('.mobile-period-card');
            
            tables.forEach(table => {
                table.style.display = 'table';
            });
            mobileCards.forEach(card => {
                card.style.display = 'none';
            });
        }
    }

    // Проверяем при загрузке и изменении размера окна
    window.addEventListener('load', adaptTablesForMobile);
    window.addEventListener('resize', adaptTablesForMobile);

    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Наблюдаем за всеми секциями для анимации
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Функция проверки прохождения теста
    function checkTestCompletion() {
        const testCompleted = localStorage.getItem('testCompleted') === 'true';
        const testRequiredMessage = document.getElementById('testRequiredMessage');
        const bookingSubmitBtn = document.getElementById('bookingSubmitBtn');
        
        if (testRequiredMessage) {
            testRequiredMessage.style.display = testCompleted ? 'none' : 'block';
        }
        
        if (bookingSubmitBtn) {
            bookingSubmitBtn.disabled = !testCompleted;
            if (!testCompleted) {
                bookingSubmitBtn.title = 'Сначала пройдите тест либидо';
            } else {
                bookingSubmitBtn.title = '';
            }
        }
    }

    // Функция показа сообщения о завершении теста
    function showTestCompletionMessage() {
        const message = document.getElementById('testCompletionMessage');
        if (message) {
            message.style.display = 'block';
            message.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Функция настройки валидации форм
    function setupFormValidation() {
        // Добавляем обработчики для полей ввода
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', function() {
                clearFieldError(this);
            });
            
            field.addEventListener('change', function() {
                clearFieldError(this);
            });
            
            // Для радиокнопок добавляем обработчик на всю группу
            if (field.type === 'radio') {
                const radioGroup = document.querySelectorAll(`input[name="${field.name}"]`);
                radioGroup.forEach(radio => {
                    radio.addEventListener('change', function() {
                        radioGroup.forEach(r => clearFieldError(r));
                    });
                });
            }
        });
    }

    // Функция очистки ошибки поля
    function clearFieldError(field) {
        field.classList.remove('error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }

    // Функция показа ошибок формы
    function showFormErrors(form) {
        let firstError = null;
        
        // Проверяем все обязательные поля
        form.querySelectorAll('[required]').forEach(field => {
            const isRadio = field.type === 'radio';
            const radioGroup = isRadio ? form.querySelectorAll(`input[name="${field.name}"]`) : null;
            const isRadioChecked = isRadio ? Array.from(radioGroup).some(radio => radio.checked) : false;
            
            if (!field.value && !isRadioChecked) {
                field.classList.add('error');
                let errorMessage;
                
                if (isRadio) {
                    // Для радиогруппы показываем ошибку у первого элемента
                    errorMessage = radioGroup[0].parentNode.parentNode.querySelector('.error-message');
                } else {
                    errorMessage = field.parentNode.querySelector('.error-message');
                }
                
                if (errorMessage) {
                    errorMessage.style.display = 'block';
                }
                
                // Запоминаем первое поле с ошибкой для скролла
                if (!firstError) {
                    firstError = isRadio ? radioGroup[0] : field;
                }
            }
        });
        
        // Прокручиваем к первой ошибке
        if (firstError) {
            firstError.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            firstError.focus();
        }
    }
});
