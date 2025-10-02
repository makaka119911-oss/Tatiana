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

    // Показ/скрытие поля для сезонных изменений (обновлено для новой формы)
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

    // Функция для создания читаемого текста результатов теста
    function createTestSummary(form) {
        // ... код функции без изменений ...
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
            // ВРЕМЕННО ЗАКОММЕНТИРУЕМ, чтобы проверить отправку без читаемого резюме
            // const summary = createTestSummary(form);
            // const summaryField = form.querySelector('#readableResults');
            // if (summaryField) {
            //     summaryField.value = summary;
            // }
        }
        
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

    // ... остальной код без изменений ...
});
