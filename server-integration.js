console.log('✅ Server integration loaded');

// Используем существующие переменные из archive.js
console.log('🌐 API Base URL:', window.API_BASE_URL);

// Проверяем что переменные доступны
if (typeof API_BASE_URL === 'undefined') {
    console.error('❌ API_BASE_URL не определена. Убедитесь что archive.js загружен первым.');
}

// Функция для преобразования файла в base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Убираем префикс data:image/jpeg;base64, 
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

// Registration function with photo support
async function handleRegistrationToServer(form) {
    try {
        const formData = new FormData(form);
        const registrationData = Object.fromEntries(formData.entries());
        
        console.log('📝 Отправка данных на сервер...', registrationData);

        // Добавляем фото в формате base64
        if (window.userPhoto) {
            try {
                registrationData.photo_data = await fileToBase64(window.userPhoto);
                console.log('✅ Фото преобразовано в base64, длина:', registrationData.photo_data.length);
            } catch (photoError) {
                console.error('❌ Ошибка преобразования фото:', photoError);
                registrationData.photo_data = null;
            }
        } else {
            console.log('⚠️ Фото не загружено');
            registrationData.photo_data = null;
        }

        console.log('📤 Отправка данных на сервер:', { 
            ...registrationData, 
            photo_data: registrationData.photo_data ? `base64 длиной ${registrationData.photo_data.length}` : 'null' 
        });

        // Send to backend API
        const serverResponse = await fetch(API_BASE_URL + '/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData)
        });

        console.log('📨 Статус ответа сервера:', serverResponse.status);
        
        const responseData = await serverResponse.json();
        console.log('📊 Ответ сервера:', responseData);

        if (!serverResponse.ok || !responseData.success) {
            throw new Error(responseData.error || 'Registration failed');
        }

        // Save registration ID for test results
        currentRegistrationId = responseData.registrationId;
        localStorage.setItem('registrationId', currentRegistrationId);
        window.registrationId = currentRegistrationId;

        console.log('✅ Регистрация на сервере успешна, ID:', currentRegistrationId);
        return true;

    } catch (error) {
        console.error('❌ Ошибка отправки на сервер:', error);
        throw error;
    }
}

// Test result function
async function handleTestResultToServer(form) {
    try {
        // Get registration ID
        const registrationId = localStorage.getItem('registrationId') || currentRegistrationId;
        if (!registrationId) {
            throw new Error('Не найден ID регистрации');
        }

        // Collect test data
        const formData = new FormData(form);
        const testData = Object.fromEntries(formData.entries());
        
        // Calculate result
        const result = calculateTestResult(testData);
        console.log('🧪 Результат теста:', result);

        // Send to backend API
        const testResponse = await fetch(API_BASE_URL + '/api/test-result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                registrationId: registrationId,
                level: result.level,
                score: result.score,
                testData: testData
            })
        });

        console.log('📨 Статус ответа теста:', testResponse.status);
        
        const testResponseData = await testResponse.json();
        console.log('📊 Ответ теста:', testResponseData);

        if (!testResponse.ok) {
            throw new Error(testResponseData.error || `HTTP ${testResponse.status}`);
        }

        if (!testResponseData.success) {
            throw new Error(testResponseData.error || 'Test submission failed');
        }

        console.log('✅ Результаты теста сохранены на сервере');
        return true;

    } catch (error) {
        console.error('❌ Ошибка отправки результатов теста:', error);
        throw error;
    }
}

// Перехватываем оригинальные функции
const originalHandleRegistrationSubmit = window.handleRegistrationSubmit;
const originalHandleTestSubmit = window.handleTestSubmit;

// Override handleRegistrationSubmit
window.handleRegistrationSubmit = async function(e) {
    e.preventDefault();
    
    if (!validateRegistrationForm(e.target)) {
        showErrorMessage('Пожалуйста, заполните все обязательные поля корректно');
        return;
    }

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
        submitBtn.disabled = true;

        // Сначала отправляем на сервер Railway
        await handleRegistrationToServer(form);
        
        // Затем вызываем оригинальную функцию для Telegram
        if (originalHandleRegistrationSubmit) {
            await originalHandleRegistrationSubmit.call(this, e);
        } else {
            // Если оригинальной функции нет, просто показываем успех
            showSuccessMessage('✅ Регистрация успешно завершена! Переходим к тесту.');
            localStorage.setItem('registrationCompleted', 'true');
            setTimeout(() => {
                showTestSection();
            }, 1500);
        }

    } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
        showErrorMessage('❌ Ошибка регистрации: ' + error.message);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
};

// Override handleTestSubmit
window.handleTestSubmit = async function(e) {
    e.preventDefault();

    if (!validateStep(6)) {
        showErrorMessage('Пожалуйста, ответьте на все обязательные вопросы этого шага');
        return;
    }

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обработка...';
        submitBtn.disabled = true;

        // Сначала отправляем на сервер Railway
        await handleTestResultToServer(form);
        
        // Затем вызываем оригинальную функцию для Telegram
        if (originalHandleTestSubmit) {
            await originalHandleTestSubmit.call(this, e);
        } else {
            // Если оригинальной функции нет, просто показываем результат
            const formData = new FormData(form);
            const testData = Object.fromEntries(formData.entries());
            const result = calculateTestResult(testData);
            showTestResult(result);
        }

        // Unlock all sections
        localStorage.setItem('diagnosticCompleted', 'true');
        unlockAllSections();
        
        showSuccessMessage('✅ Диагностика завершена! Теперь вам доступны все разделы сайта.');

    } catch (error) {
        console.error('❌ Ошибка отправки теста:', error);
        showErrorMessage('❌ Ошибка сохранения результатов: ' + error.message);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
};

console.log('🚀 Server integration initialized successfully');
