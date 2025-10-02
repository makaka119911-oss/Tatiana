// Formspree endpoints - РАЗНЫЕ ДЛЯ КАЖДОЙ ФОРМЫ!
  // Настройки Telegram
const TELEGRAM_USERNAME = 'Tan4ik77G';

// Функция для определения мобильного устройства
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Функция для копирования текста в буфер обмена
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const success = document.execCommand('copy');
            textArea.remove();
            return success;
        }
    } catch (error) {
        console.error('Ошибка копирования:', error);
        return false;
    }
}

// Функция для открытия Telegram
function openTelegram() {
    // Пытаемся открыть приложение Telegram
    window.location.href = `tg://resolve?domain=${TELEGRAM_USERNAME}`;
    
    // Fallback: через 2 секунды открываем веб-версию, если приложение не открылось
    setTimeout(() => {
        window.open(`https://t.me/${TELEGRAM_USERNAME}`, '_blank');
    }, 2000);
}

// Основная функция инициализации
document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт загружен');

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
    const seasonalRadio = document.querySelectorAll('input[name="seasonal_dependency"]');
    const seasonalDescription = document.getElementById('seasonalDescription');
    
    if (seasonalRadio.length > 0 && seasonalDescription) {
        seasonalRadio.forEach(radio => {
            radio.addEventListener('change', function() {
                seasonalDescription.style.display = this.value === 'yes' ? 'block' : 'none';
            });
        });
    }

    // Форма записи на консультацию
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Получаем данные
            const name = this.querySelector('[name="name"]').value;
            const contact = this.querySelector('[name="contact"]').value;
            const email = this.querySelector('[name="email"]').value;
            const service = this.querySelector('[name="service"]').value;
            const message = this.querySelector('[name="message"]').value;
            
            // Формируем сообщение
            const messageText = `🎯 НОВАЯ ЗАЯВКА НА КОНСУЛЬТАЦИЮ

👤 Имя: ${name}
📞 Контакт: ${contact}
📧 Email: ${email || 'Не указан'}
🎭 Формат: ${service}
💬 Сообщение: ${message || 'Не указано'}

⏰ ${new Date().toLocaleString('ru-RU')}`;

            // URL-encoded версия для десктопов
            const encodedMessage = encodeURIComponent(messageText.replace(/\n/g, '%0A'));
            
            // Показываем загрузку
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            submitBtn.disabled = true;
            
            try {
                if (isMobileDevice()) {
                    // Для мобильных устройств
                    const copySuccess = await copyToClipboard(messageText);
                    
                    if (copySuccess) {
                        alert('✅ Текст заявки скопирован!\n\nТеперь:\n1. Откройте Telegram\n2. Напишите @Tan4ik77G\n3. Вставьте скопированный текст\n4. Отправьте сообщение');
                        openTelegram();
                    } else {
                        alert('📋 Заявка готова для отправки!\n\nСкопируйте этот текст:\n\n' + messageText + '\n\nЗатем:\n1. Откройте Telegram\n2. Напишите @Tan4ik77G\n3. Вставьте этот текст\n4. Отправьте сообщение');
                        openTelegram();
                    }
                } else {
                    // Для десктопов
                    window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${encodedMessage}`, '_blank');
                    alert('✅ Заявка отправлена! Я свяжусь с вами в течение 24 часов.');
                }
                
                // Сбрасываем форму
                this.reset();
                
            } catch (error) {
                console.error('Ошибка:', error);
                alert('❌ Произошла ошибка. Пожалуйста, свяжитесь со мной напрямую:\n📞 +7 (905) 595-99-96\n✉️ @Tan4ik77G');
            } finally {
                // Восстанавливаем кнопку
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Форма теста
    const testForm = document.getElementById('libidoTestForm');
    if (testForm) {
        testForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Собираем основные данные из теста
            const generalFrequency = this.querySelector('[name="general_frequency"]:checked')?.value || 'Не указано';
            const desireStrength = this.querySelector('[name="desire_strength"]:checked')?.value || 'Не указано';
            const arousalPenis = this.querySelector('[name="arousal_penis"]:checked')?.value || 'Не указано';
            const seasonal = this.querySelector('[name="seasonal_dependency"]:checked')?.value || 'Не указано';
            
            const messageText = `📊 НОВАЯ АНКЕТА ЛИБИДО

📈 Общая частота: ${generalFrequency}
💪 Сила желания: ${desireStrength}
🔥 Возбуждение от вида: ${arousalPenis}
🌦️ Сезонная зависимость: ${seasonal}

⏰ ${new Date().toLocaleString('ru-RU')}

Полная анкета будет проанализирована отдельно`;

            // URL-encoded версия для десктопов
            const encodedMessage = encodeURIComponent(messageText.replace(/\n/g, '%0A'));
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка анкеты...';
            submitBtn.disabled = true;
            
            try {
                if (isMobileDevice()) {
                    // Для мобильных устройств
                    const copySuccess = await copyToClipboard(messageText);
                    
                    if (copySuccess) {
                        alert('✅ Текст анкеты скопирован!\n\nТеперь:\n1. Откройте Telegram\n2. Напишите @Tan4ik77G\n3. Вставьте скопированный текст\n4. Отправьте сообщение');
                        openTelegram();
                    } else {
                        alert('📋 Анкета готова для отправки!\n\nСкопируйте этот текст:\n\n' + messageText + '\n\nЗатем:\n1. Откройте Telegram\n2. Напишите @Tan4ik77G\n3. Вставьте этот текст\n4. Отправьте сообщение');
                        openTelegram();
                    }
                } else {
                    // Для десктопов
                    window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${encodedMessage}`, '_blank');
                    alert('✅ Анкета отправлена! Спасибо за ваши ответы.');
                }
                
                // Сбрасываем форму
                this.reset();
                
            } catch (error) {
                console.error('Ошибка:', error);
                alert('❌ Произошла ошибка отправки анкеты.');
            } finally {
                // Восстанавливаем кнопку
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
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

    // Добавляем обработку наведения для интерактивных элементов
    document.querySelectorAll('.btn, .service-card, .step, .contact-item, .option-item').forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

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
});
