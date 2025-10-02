// Formspree endpoints
const FORMSPREE_BOOKING = 'https://formspree.io/f/xrbykqya'; // для записи
const FORMSPREE_TEST = 'https://formspree.io/f/xpwyrdyp'; // для теста

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

    // Функция для отправки формы
    async function submitForm(form, endpoint, successMessage) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Показываем загрузку
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(form);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Успешная отправка
                alert(successMessage);
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
                throw new Error('Ошибка отправки формы');
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
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
            submitForm(
                this, 
                FORMSPREE_BOOKING, 
                '✅ Заявка отправлена! Я свяжусь с вами в течение 24 часов.'
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
                '✅ Анкета отправлена! Спасибо за ваши ответы. Я свяжусь с вами для обсуждения результатов.'
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
});
