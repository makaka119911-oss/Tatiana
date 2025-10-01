// Formspree endpoints - РАЗНЫЕ ДЛЯ КАЖДОЙ ФОРМЫ!
    const FORMSPREE_ENDPOINT_TEST = 'https://formspree.io/f/xgvnkwgl'; // для теста
    const FORMSPREE_ENDPOINT_BOOKING = 'https://formspree.io/f/xgvnkwgl'; // для записи (пока тот же, замените!)

    // Mobile menu toggle
    document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
        document.querySelector('.nav-links').classList.toggle('active');
    });

    // Show/hide seasonal description
    document.querySelectorAll('input[name="seasonal_dependency"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const descriptionBlock = document.getElementById('seasonalDescription');
            descriptionBlock.style.display = this.value === 'yes' ? 'block' : 'none';
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector('.nav-links').classList.remove('active');
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all sections for animation
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Функция для создания русскоязычного текста из данных формы
    function createRussianText(formData) {
        let russianText = "АНКЕТА ЖЕНСКОГО ЛИБИДО\n\n";
        
        // Маппинг значений на русский язык
        const valueMapping = {
            // Общая частота
            'never': 'Вообще не хочется',
            'weekly': '1 раз в неделю',
            '3days': '1 раз в 3 дня',
            '2days': 'Через день',
            'daily': 'Каждый день',
            'multiple': 'Каждый день по много раз',
            
            // Сила желания
            'light': 'Легкое желание',
            'medium': 'Среднее желание',
            'strong': 'Сильное желание',
            'very_strong': 'Очень сильное желание',
            'maximal': 'Максимально сильное желание',
            
            // Возбуждение
            'not_at_all': 'Вообще не возбуждает',
            'slightly': 'Немного возбуждает',
            'moderately': 'Средне возбуждает',
            'strongly': 'Сильно возбуждает',
            'very_strongly': 'Очень сильно возбуждает',
            
            // Сезонная зависимость
            'no': 'Нет',
            'yes': 'Да'
        };

        const periodNames = {
            'period1': 'От конца месячных до овуляции',
            'period2': 'В период овуляции',
            'period3': 'От конца овуляции до начала месячных',
            'period4': 'В период месячных'
        };

        // Обработка общих вопросов
        if (formData.get('general_frequency')) {
            russianText += `ОБЩИЕ ПОКАЗАТЕЛИ ЛИБИДО:\n`;
            russianText += `Как часто в целом хочется секса: ${valueMapping[formData.get('general_frequency')] || formData.get('general_frequency')}\n`;
            russianText += `Сила желания: ${valueMapping[formData.get('desire_strength')] || formData.get('desire_strength')}\n`;
            russianText += `Возбуждение от вида: ${valueMapping[formData.get('arousal_penis')] || formData.get('arousal_penis')}\n\n`;
        }

        // Обработка периодов
        for (let i = 1; i <= 4; i++) {
            const periodKey = `period${i}`;
            const noDesireFreq = formData.get(`${periodKey}_no_desire_frequency`);
            const desireStrength = formData.get(`${periodKey}_desire_strength`);
            const noDesireArousal = formData.get(`${periodKey}_no_desire_arousal`);
            const desireArousal = formData.get(`${periodKey}_desire_arousal`);

            if (noDesireFreq || desireStrength) {
                russianText += `${periodNames[periodKey]}:\n`;
                
                if (noDesireFreq || noDesireArousal) {
                    russianText += `В дни, когда НЕ хочется секса:\n`;
                    if (noDesireFreq) russianText += `  Частота: ${valueMapping[noDesireFreq] || noDesireFreq}\n`;
                    if (noDesireArousal) russianText += `  Возбуждение: ${valueMapping[noDesireArousal] || noDesireArousal}\n`;
                }
                
                if (desireStrength || desireArousal) {
                    russianText += `В дни, когда хочется секса:\n`;
                    if (desireStrength) russianText += `  Сила желания: ${valueMapping[desireStrength] || desireStrength}\n`;
                    if (desireArousal) russianText += `  Возбуждение: ${valueMapping[desireArousal] || desireArousal}\n`;
                }
                russianText += '\n';
            }
        }

        // Сезонные особенности
        if (formData.get('seasonal_dependency')) {
            russianText += `СЕЗОННЫЕ ОСОБЕННОСТИ:\n`;
            russianText += `Зависит от времени года: ${valueMapping[formData.get('seasonal_dependency')] || formData.get('seasonal_dependency')}\n`;
            if (formData.get('seasonal_changes')) {
                russianText += `Описание изменений: ${formData.get('seasonal_changes')}\n`;
            }
        }

        return russianText;
    }

    // Улучшенная функция отправки формы
    async function handleFormSubmit(form, submitBtn, messageEl, successMessage, isTestForm = false) {
        event.preventDefault();
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        
        const formData = new FormData(form);
        
        // Выбираем правильный endpoint
        const endpoint = isTestForm ? FORMSPREE_ENDPOINT_TEST : FORMSPREE_ENDPOINT_BOOKING;
        
        // Для тестовой формы создаем русскоязычную версию
        if (isTestForm) {
            const russianText = createRussianText(formData);
            formData.append('russian_version', russianText);
            
            // Добавляем понятные названия для основных полей
            formData.append('Общая частота', formData.get('general_frequency') || 'Не указано');
            formData.append('Сила желания', formData.get('desire_strength') || 'Не указано');
            formData.append('Возбуждение от вида', formData.get('arousal_penis') || 'Не указано');
        }
        
        // Для формы бронирования тоже добавляем русские названия
        if (!isTestForm) {
            formData.append('Имя клиента', formData.get('name') || 'Не указано');
            formData.append('Контактные данные', formData.get('contact') || 'Не указано');
            formData.append('Формат консультации', formData.get('service') || 'Не указано');
            formData.append('Сообщение', formData.get('message') || 'Не указано');
        }
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                messageEl.textContent = successMessage;
                messageEl.className = 'form-message success';
                messageEl.style.display = 'block';
                
                form.reset();
                
                const seasonalDesc = document.getElementById('seasonalDescription');
                if (seasonalDesc) seasonalDesc.style.display = 'none';
                
            } else {
                throw new Error('Form submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            messageEl.innerHTML = `
                <strong>Произошла ошибка при отправке.</strong><br>
                Пожалуйста, свяжитесь со мной напрямую:<br>
                📞 Телефон: +7 (905) 595-99-96<br>
                ✉️ Telegram: @Tan4ik77G<br>
                📧 Email: Tan4ik017@gmail.com
            `;
            messageEl.className = 'form-message error';
            messageEl.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            if (isTestForm) {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить анкету';
            } else {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить заявку';
            }
            
            // Плавная прокрутка к сообщению
            messageEl.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
        }
    }

    // Booking form submission
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        handleFormSubmit(
            this, 
            document.getElementById('bookingSubmitBtn'),
            document.getElementById('bookingMessage'),
            'Благодарю за заявку! Я свяжусь с вами в ближайшее время для подтверждения записи.',
            false
        );
    });

    // Test form submission
    document.getElementById('libidoTestForm').addEventListener('submit', function(e) {
        handleFormSubmit(
            this,
            document.getElementById('testSubmitBtn'),
            document.getElementById('testMessage'),
            'Благодарю за заполнение анкеты! Ваши ответы помогут мне лучше понять вашу ситуацию. Я свяжусь с вами для обсуждения результатов.',
            true
        );
    });

    // Add hover effects to all interactive elements
    document.querySelectorAll('.btn, .service-card, .step, .contact-item, .option-item').forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Добавляем обработчики для мобильных полей (синхронизация с основными)
    document.addEventListener('change', function(e) {
        // Если изменение произошло в мобильном поле, синхронизируем с основным
        if (e.target.name && e.target.name.includes('_mobile')) {
            const mainFieldName = e.target.name.replace('_mobile', '');
            const mainField = document.querySelector(`[name="${mainFieldName}"]`);
            if (mainField) {
                mainField.value = e.target.value;
            }
        }
        
        // И наоборот - если изменение в основном поле, синхронизируем с мобильным
        if (e.target.name && !e.target.name.includes('_mobile')) {
            const mobileFieldName = e.target.name + '_mobile';
            const mobileField = document.querySelector(`[name="${mobileFieldName}"]`);
            if (mobileField) {
                mobileField.value = e.target.value;
            }
        }
    });

    // Гарантируем отображение теста на мобильных устройствах
    function ensureTestVisibility() {
        if (window.innerWidth <= 768) {
            const testSection = document.getElementById('test');
            const mobileCards = document.querySelectorAll('.mobile-period-card');
            const tables = document.querySelectorAll('.period-table');
            
            // Гарантируем, что тест виден
            if (testSection) {
                testSection.style.display = 'block';
                testSection.style.visibility = 'visible';
                testSection.style.opacity = '1';
            }
            
            // Гарантируем, что мобильные карточки видны
            mobileCards.forEach(card => {
                card.style.display = 'block';
                card.style.visibility = 'visible';
                card.style.opacity = '1';
            });
            
            // Гарантируем, что таблицы скрыты
            tables.forEach(table => {
                table.style.display = 'none';
            });
        }
    }

    // Проверяем при загрузке и изменении размера окна
    window.addEventListener('load', ensureTestVisibility);
    window.addEventListener('resize', ensureTestVisibility);
    // Дополнительная проверка после полной загрузки DOM
    document.addEventListener('DOMContentLoaded', ensureTestVisibility);

