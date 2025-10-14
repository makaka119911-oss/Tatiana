document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===== GLOBAL STATE =====
    const state = {
        currentTest: 'libido',
        formSubmissions: {
            libido: 0,
            menopause: 0
        },
        testCompletion: {
            libido: false,
            menopause: false
        }
    };

    // ===== DOM ELEMENTS =====
    const elements = {
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        testTypeBtns: document.querySelectorAll('.test-type-btn'),
        libidoTest: document.getElementById('libidoTest'),
        menopauseTest: document.getElementById('menopauseTest'),
        testCompletionMessage: document.getElementById('testCompletionMessage'),
        libidoTestForm: document.getElementById('libidoTestForm'),
        menopauseTestForm: document.getElementById('menopauseTestForm'),
        bookingForm: document.getElementById('bookingForm'),
        seasonalRadio: document.querySelectorAll('input[name="seasonal_dependency"]'),
        seasonalDescription: document.getElementById('seasonalDescription')
    };

    // ===== FORMSPREE ENDPOINTS =====
    const FORMSPREE_ENDPOINTS = {
        libido: 'https://formspree.io/f/your-libido-form-id',
        menopause: 'https://formspree.io/f/your-menopause-form-id',
        booking: 'https://formspree.io/f/your-booking-form-id'
    };

    // ===== INITIALIZATION =====
    function init() {
        setupEventListeners();
        setupIntersectionObserver();
        setupFormValidation();
        restoreFormState();
    }

    // ===== EVENT LISTENERS SETUP =====
    function setupEventListeners() {
        // Mobile menu
        if (elements.mobileMenuBtn && elements.navLinks) {
            elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleSmoothScroll);
        });

        // Test type switching
        elements.testTypeBtns.forEach(btn => {
            btn.addEventListener('click', handleTestTypeSwitch);
        });

        // Seasonal dependency toggle
        if (elements.seasonalRadio.length > 0 && elements.seasonalDescription) {
            elements.seasonalRadio.forEach(radio => {
                radio.addEventListener('change', handleSeasonalToggle);
            });
        }

        // Form submissions
        if (elements.libidoTestForm) {
            elements.libidoTestForm.addEventListener('submit', handleLibidoTestSubmit);
        }

        if (elements.menopauseTestForm) {
            elements.menopauseTestForm.addEventListener('submit', handleMenopauseTestSubmit);
        }

        if (elements.bookingForm) {
            elements.bookingForm.addEventListener('submit', handleBookingSubmit);
        }

        // Real-time form validation
        document.addEventListener('input', handleRealTimeValidation);
        document.addEventListener('change', handleRealTimeValidation);

        // Window resize for responsive behavior
        window.addEventListener('resize', handleWindowResize);
    }

    // ===== MOBILE MENU =====
    function toggleMobileMenu() {
        elements.navLinks.classList.toggle('active');
        const icon = elements.mobileMenuBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
        
        // Add animation class for smooth transition
        elements.navLinks.style.transition = 'all 0.3s ease-in-out';
    }

    // ===== SMOOTH SCROLLING =====
    function handleSmoothScroll(e) {
        e.preventDefault();
        
        if (elements.navLinks) {
            elements.navLinks.classList.remove('active');
            // Reset mobile menu icon
            const icon = elements.mobileMenuBtn.querySelector('i');
            if (icon.classList.contains('fa-times')) {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        }
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // ===== TEST TYPE SWITCHING =====
    function handleTestTypeSwitch() {
        // Remove active class from all buttons
        elements.testTypeBtns.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Update state
        state.currentTest = this.dataset.testType;
        
        // Show/hide appropriate test
        if (state.currentTest === 'libido') {
            elements.libidoTest.style.display = 'block';
            elements.menopauseTest.style.display = 'none';
        } else {
            elements.libidoTest.style.display = 'none';
            elements.menopauseTest.style.display = 'block';
        }
        
        // Save to localStorage
        saveToLocalStorage('currentTest', state.currentTest);
        
        // Show completion message if test was already completed
        showTestCompletionIfNeeded();
    }

    // ===== SEASONAL TOGGLE =====
    function handleSeasonalToggle() {
        const shouldShow = this.value === 'Да';
        elements.seasonalDescription.style.display = shouldShow ? 'block' : 'none';
        
        // Toggle required attribute
        const textarea = elements.seasonalDescription.querySelector('textarea');
        if (textarea) {
            textarea.required = shouldShow;
        }
    }

    // ===== FORM SUBMISSION HANDLERS =====
    async function handleLibidoTestSubmit(e) {
        e.preventDefault();
        await handleTestSubmission(e.target, 'libido');
    }

    async function handleMenopauseTestSubmit(e) {
        e.preventDefault();
        await handleTestSubmission(e.target, 'menopause');
    }

    async function handleBookingSubmit(e) {
        e.preventDefault();
        await handleFormSubmission(e.target, FORMSPREE_ENDPOINTS.booking, 'booking');
    }

    // ===== TEST SUBMISSION =====
    async function handleTestSubmission(form, testType) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Validate form
        if (!validateForm(form)) {
            showNotification('❌ Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        try {
            // Create readable summary
            const summary = createTestSummary(form, testType);
            
            // Prepare form data
            const formData = new FormData(form);
            formData.append('test_type', testType);
            formData.append('readable_summary', summary);
            formData.append('submission_timestamp', new Date().toISOString());
            
            // Send to Formspree
            const response = await fetch(FORMSPREE_ENDPOINTS[testType], {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Success
                state.formSubmissions[testType]++;
                state.testCompletion[testType] = true;
                
                showNotification('✅ Анкета отправлена успешно! Я свяжусь с вами для обсуждения результатов.', 'success');
                showTestCompletionMessage();
                
                // Save completion state
                saveToLocalStorage(`testCompleted_${testType}`, true);
                saveToLocalStorage(`formData_${testType}`, Object.fromEntries(formData));
                
                form.reset();
                resetSeasonalSection();
                
            } else {
                throw new Error('Ошибка отправки формы');
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            showNotification('❌ Ошибка отправки. Пожалуйста, позвоните мне: +7 (905) 595-99-96', 'error');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // ===== FORM SUBMISSION =====
    async function handleFormSubmission(form, endpoint, formType) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        if (!validateForm(form)) {
            showNotification('❌ Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(form);
            formData.append('form_type', formType);
            formData.append('submission_timestamp', new Date().toISOString());
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                showNotification('✅ Заявка отправлена! Я свяжусь с вами в течение 24 часов.', 'success');
                form.reset();
                saveToLocalStorage(`formData_${formType}`, Object.fromEntries(formData));
            } else {
                throw new Error('Ошибка отправки формы');
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            showNotification('❌ Ошибка отправки. Пожалуйста, позвоните мне: +7 (905) 595-99-96', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // ===== FORM VALIDATION =====
    function setupFormValidation() {
        // Add input event listeners for real-time validation
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
            });
        });
    }

    function validateForm(form) {
        let isValid = true;
        let firstErrorField = null;
        
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
                if (!firstErrorField) {
                    firstErrorField = field;
                }
            }
        });
        
        // Special validation for radio groups
        const radioGroups = new Set();
        form.querySelectorAll('input[type="radio"][required]').forEach(radio => {
            radioGroups.add(radio.name);
        });
        
        radioGroups.forEach(groupName => {
            const isRadioGroupValid = form.querySelector(`input[name="${groupName}"]:checked`);
            if (!isRadioGroupValid) {
                isValid = false;
                const firstRadio = form.querySelector(`input[name="${groupName}"]`);
                if (firstRadio && !firstErrorField) {
                    firstErrorField = firstRadio;
                }
            }
        });
        
        // Scroll to first error
        if (firstErrorField) {
            scrollToElement(firstErrorField);
        }
        
        return isValid;
    }

    function validateField(field) {
        const value = field.type === 'checkbox' || field.type === 'radio' ? 
                     (field.checked || isRadioGroupChecked(field)) : field.value;
        
        let isValid = true;
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
        }
        
        // Age validation
        if (field.name === 'clientAge' && value) {
            const age = parseInt(value);
            isValid = age >= 18 && age <= 80;
        }
        
        // Update field appearance
        if (isValid) {
            field.classList.remove('error');
            const errorMessage = field.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        } else {
            field.classList.add('error');
            const errorMessage = field.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.style.display = 'block';
            }
        }
        
        return isValid;
    }

    function isRadioGroupChecked(radio) {
        const groupName = radio.name;
        const form = radio.form;
        return form.querySelector(`input[name="${groupName}"]:checked`) !== null;
    }

    function handleRealTimeValidation(e) {
        if (e.target.matches('input, select, textarea')) {
            validateField(e.target);
        }
    }

    // ===== TEST SUMMARY CREATION =====
    function createTestSummary(form, testType) {
        let summary = `РЕЗУЛЬТАТЫ ТЕСТА: ${testType === 'libido' ? 'ЛИБИДО' : 'МЕНОПАУЗА'}\n\n`;
        summary += "=".repeat(50) + "\n\n";
        
        // Contact information
        const name = form.querySelector('[name="Имя_клиента"]')?.value || 'Не указано';
        const age = form.querySelector('[name="Возраст"]')?.value || 'Не указано';
        const contact = form.querySelector('[name="Контактные_данные"]')?.value || 'Не указано';
        
        summary += `ИМЯ: ${name}\n`;
        summary += `ВОЗРАСТ: ${age}\n`;
        summary += `КОНТАКТЫ: ${contact}\n\n`;
        
        // General questions
        const generalFrequency = form.querySelector('input[name="general_frequency"]:checked, input[name="menopause_general_frequency"]:checked');
        const generalStrength = form.querySelector('input[name="general_strength"]:checked, input[name="menopause_general_strength"]:checked');
        
        if (generalFrequency) {
            summary += `ОБЩАЯ ЧАСТОТА: ${generalFrequency.value}\n`;
        }
        if (generalStrength) {
            summary += `ОБЩАЯ СИЛА ЖЕЛАНИЯ: ${generalStrength.value}\n`;
        }
        
        summary += "\n--- ПО ПЕРИОДАМ ЦИКЛА ---\n\n";
        
        // Period questions
        const periods = [
            { name: "От конца месячных до овуляции", prefix: "period1" },
            { name: "В период овуляции", prefix: "period2" },
            { name: "От конца овуляции до начала месячных", prefix: "period3" },
            { name: "В период месячных", prefix: "period4" }
        ];
        
        periods.forEach(period => {
            summary += `ПЕРИОД: ${period.name}\n`;
            
            const frequency = form.querySelector(`select[name="${period.prefix}_frequency"], select[name="menopause_${period.prefix}_frequency"]`);
            const strength = form.querySelector(`select[name="${period.prefix}_strength"], select[name="menopause_${period.prefix}_strength"]`);
            
            if (frequency && frequency.value) summary += `  Частота: ${frequency.value}\n`;
            if (strength && strength.value) summary += `  Сила: ${strength.value}\n`;
            
            summary += "\n";
        });
        
        // Seasonal information
        const seasonal = form.querySelector('input[name="seasonal_dependency"]:checked, input[name="menopause_seasonal_dependency"]:checked');
        const seasonalText = form.querySelector('textarea[name="seasonal_changes"], textarea[name="menopause_seasonal_changes"]');
        
        if (seasonal) {
            summary += `СЕЗОННАЯ ЗАВИСИМОСТЬ: ${seasonal.value}\n`;
            if (seasonalText && seasonalText.value) {
                summary += `ОПИСАНИЕ: ${seasonalText.value}\n`;
            }
        }
        
        summary += "=".repeat(50) + "\n";
        summary += "Дата заполнения: " + new Date().toLocaleString('ru-RU');
        
        return summary;
    }

    // ===== NOTIFICATION SYSTEM =====
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const backgroundColor = type === 'success' ? '#27ae60' : 
                              type === 'error' ? '#e74c3c' : '#3498db';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 10000;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${getNotificationIcon(type)}"></i> ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Add CSS animations if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // ===== TEST COMPLETION =====
    function showTestCompletionMessage() {
        if (elements.testCompletionMessage) {
            elements.testCompletionMessage.style.display = 'block';
            scrollToElement(elements.testCompletionMessage);
        }
    }

    function showTestCompletionIfNeeded() {
        if (state.testCompletion[state.currentTest] && elements.testCompletionMessage) {
            elements.testCompletionMessage.style.display = 'block';
        }
    }

    // ===== ANIMATIONS AND INTERSECTION OBSERVER =====
    function setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add floating animation to specific elements
                    if (entry.target.classList.contains('service-card') || 
                        entry.target.classList.contains('power-item') ||
                        entry.target.classList.contains('step')) {
                        entry.target.classList.add('floating');
                    }
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all sections and animated elements
        document.querySelectorAll('section, .service-card, .power-item, .step').forEach(el => {
            observer.observe(el);
        });
    }

    // ===== RESPONSIVE BEHAVIOR =====
    function handleWindowResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768 && elements.navLinks) {
            elements.navLinks.classList.remove('active');
            const icon = elements.mobileMenuBtn.querySelector('i');
            if (icon.classList.contains('fa-times')) {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        }
        
        // Adapt tables for mobile if needed
        adaptTablesForMobile();
    }

    function adaptTablesForMobile() {
        // Implementation for responsive tables if needed
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            if (window.innerWidth <= 768) {
                table.classList.add('mobile-table');
            } else {
                table.classList.remove('mobile-table');
            }
        });
    }

    // ===== FORM STATE MANAGEMENT =====
    function saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(`tatyana_solar_${key}`, JSON.stringify(value));
        } catch (error) {
            console.warn('LocalStorage is not available:', error);
        }
    }

    function getFromLocalStorage(key) {
        try {
            const item = localStorage.getItem(`tatyana_solar_${key}`);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.warn('LocalStorage is not available:', error);
            return null;
        }
    }

    function restoreFormState() {
        // Restore current test type
        const savedTestType = getFromLocalStorage('currentTest');
        if (savedTestType && savedTestType !== state.currentTest) {
            const targetBtn = document.querySelector(`[data-test-type="${savedTestType}"]`);
            if (targetBtn) {
                targetBtn.click();
            }
        }
        
        // Restore test completion states
        state.testCompletion.libido = getFromLocalStorage('testCompleted_libido') || false;
        state.testCompletion.menopause = getFromLocalStorage('testCompleted_menopause') || false;
        
        // Restore form data if needed
        restoreFormData('libido', elements.libidoTestForm);
        restoreFormData('menopause', elements.menopauseTestForm);
    }

    function restoreFormData(testType, form) {
        const savedData = getFromLocalStorage(`formData_${testType}`);
        if (savedData && form) {
            Object.keys(savedData).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === 'radio' || field.type === 'checkbox') {
                        const matchingField = form.querySelector(`[name="${key}"][value="${savedData[key]}"]`);
                        if (matchingField) {
                            matchingField.checked = true;
                        }
                    } else {
                        field.value = savedData[key];
                    }
                }
            });
        }
    }

    // ===== UTILITY FUNCTIONS =====
    function scrollToElement(element) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - 20;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    function resetSeasonalSection() {
        if (elements.seasonalDescription) {
            elements.seasonalDescription.style.display = 'none';
        }
        elements.seasonalRadio.forEach(radio => {
            radio.checked = false;
        });
    }

    // ===== PERFORMANCE OPTIMIZATIONS =====
    // Debounce function for resize events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function for scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Apply performance optimizations
    const debouncedResize = debounce(handleWindowResize, 250);
    window.addEventListener('resize', debouncedResize);

    // ===== ERROR HANDLING =====
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        showNotification('Произошла непредвиденная ошибка. Пожалуйста, обновите страницу.', 'error');
    });

    // ===== INITIALIZE APPLICATION =====
    init();
});
