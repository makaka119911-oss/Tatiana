// Функция отправки формы теста
async function submitTestForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        // Собираем данные формы
        const formData = new FormData(form);
        const data = {};
        
        // Преобразуем FormData в обычный объект
        for (let [key, value] of formData.entries()) {
            // Обрабатываем чекбоксы для менопаузы
            if (key === 'menopause_physical_changes') {
                if (!data[key]) data[key] = [];
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }
        
        console.log('Данные формы:', data);
        
        // Форматируем красивое сообщение для Telegram с правильными переносами
        let message = `🌸 *НОВАЯ АНКЕТА ТЕСТА ЛИБИДО* 🌸\n\n`;
        
        // Контактная информация
        message += `👤 *Контактная информация:*\n`;
        if (data.Имя_клиента) message += `   └ *Имя:* ${data.Имя_клиента}\n`;
        if (data.Возраст) message += `   └ *Возраст:* ${data.Возраст}\n`;
        if (data.Контактные_данные) message += `   └ *Контакты:* ${data.Контактные_данные}\n`;
        
        // Тип теста
        const isRegularTest = document.getElementById('regular_test').checked;
        message += `   └ *Тип теста:* ${isRegularTest ? 'Обычный' : 'Менопауза'}\n\n`;
        
        // Общие показатели
        message += `📊 *Общие показатели:*\n`;
        if (data.general_frequency) message += `   └ *Частота:* ${data.general_frequency}\n`;
        if (data.general_strength) message += `   └ *Сила желания:* ${data.general_strength}\n\n`;
        
        if (isRegularTest) {
            // Данные для обычного теста
            message += `📅 *Периоды цикла:*\n\n`;
            
            const periods = [
                { name: "🌱 От конца месячных до овуляции", prefix: "period1" },
                { name: "🌺 В период овуляции", prefix: "period2" },
                { name: "🍂 От конца овуляции до начала месячных", prefix: "period3" },
                { name: "🌸 В период месячных", prefix: "period4" }
            ];
            
            periods.forEach(period => {
                message += `   ${period.name}:\n`;
                if (data[`${period.prefix}_frequency`]) message += `      └ *Частота:* ${data[`${period.prefix}_frequency`]}\n`;
                if (data[`${period.prefix}_strength`]) message += `      └ *Сила:* ${data[`${period.prefix}_strength`]}\n`;
                if (data[`${period.prefix}_erected_desire`]) message += `      └ *Возбуждение (с желанием):* ${data[`${period.prefix}_erected_desire`]}\n`;
                if (data[`${period.prefix}_erected_no_desire`]) message += `      └ *Возбуждение (без желания):* ${data[`${period.prefix}_erected_no_desire`]}\n`;
                message += `\n`;
            });
        } else {
            // Данные для менопаузы
            message += `🍃 *Данные по менопаузе:*\n`;
            if (data.menopause_status) message += `   └ *Статус:* ${data.menopause_status}\n`;
            if (data.menopause_libido_change) message += `   └ *Изменение либидо:* ${data.menopause_libido_change}\n`;
            if (data.menopause_current_frequency) message += `   └ *Текущая частота:* ${data.menopause_current_frequency}\n`;
            if (data.menopause_intensity) message += `   └ *Интенсивность:* ${data.menopause_intensity}\n`;
            if (data.menopause_hrt) message += `   └ *ГЗТ:* ${data.menopause_hrt}\n`;
            if (data.menopause_physical_changes && Array.isArray(data.menopause_physical_changes)) {
                message += `   └ *Физические изменения:* ${data.menopause_physical_changes.join(', ')}\n`;
            }
            if (data.menopause_concerns) message += `   └ *Беспокойства:* ${data.menopause_concerns}\n\n`;
        }
        
        // Сезонные особенности
        if (data.seasonal_dependency) {
            message += `🌤️ *Сезонная зависимость:*\n`;
            message += `   └ *Наличие:* ${data.seasonal_dependency}\n`;
            if (data.seasonal_changes) {
                message += `   └ *Описание:* ${data.seasonal_changes}\n\n`;
            }
        }
        
        message += `⏰ *Дата заполнения:* ${new Date().toLocaleString('ru-RU')}`;

        console.log('Сообщение для Telegram:', message);

        // Отправляем в Telegram - используем обычные переносы строк вместо \\n
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();
        
        if (!response.ok || !result.ok) {
            console.error('Ошибка Telegram API:', result);
            throw new Error(result.description || 'Ошибка отправки в Telegram');
        }

        showSuccessMessage('✅ Анкета отправлена! Теперь вы можете записаться на консультацию.');
        
        // Сохраняем статус прохождения теста
        localStorage.setItem('testCompleted', 'true');
        localStorage.setItem('testCompletionTime', new Date().toISOString());
        
        // Показываем сообщение о завершении теста
        const completionMessage = document.getElementById('testCompletionMessage');
        if (completionMessage) {
            completionMessage.style.display = 'block';
            completionMessage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
        
        // Обновляем отображение формы записи
        checkTestCompletion();
        
        // Сбрасываем форму
        form.reset();
        
        // Сбрасываем отображение сезонного описания
        const seasonalDescription = document.getElementById('seasonalDescription');
        if (seasonalDescription) seasonalDescription.style.display = 'none';
        
    } catch (error) {
        console.error('Ошибка отправки формы:', error);
        showErrorMessage('❌ Ошибка отправки. Пожалуйста, свяжитесь со мной напрямую: +7 (905) 595-99-96');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Функция отправки формы записи
async function submitBookingForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // ✅ СРАЗУ ПРОВЕРЯЕМ СТАТУС ТЕСТА ПРИ ЛЮБОЙ ПОПЫТКЕ ОТПРАВКИ
    const testCompleted = localStorage.getItem('testCompleted') === 'true';
    if (!testCompleted) {
        showErrorMessage('❌ Для записи на консультацию необходимо сначала пройти тест энергии');
        document.getElementById('test').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        return; // Полностью останавливаем выполнение функции
    }
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        // Собираем данные формы записи
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Формируем красивое сообщение для записи с правильными переносами
        let bookingMessage = `💫 *НОВАЯ ЗАПИСЬ НА КОНСУЛЬТАЦИЮ!* 💫\n\n`;
        
        bookingMessage += `👤 *Контактные данные:*\n`;
        bookingMessage += `   └ *Имя:* ${data.name}\n`;
        bookingMessage += `   └ *Контакты:* ${data.contact}\n`;
        bookingMessage += `   └ *Формат работы:* ${data.service}\n`;
        if (data.email) bookingMessage += `   └ *Email:* ${data.email}\n`;
        
        if (data.message) {
            bookingMessage += `\n💬 *Сообщение клиента:*\n`;
            bookingMessage += `   └ ${data.message}\n`;
        }
        
        bookingMessage += `\n⏰ *Дата заявки:* ${new Date().toLocaleString('ru-RU')}`;
        
        // Отправляем в Telegram - используем обычные переносы строк вместо \\n
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: bookingMessage,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();
        
        if (!response.ok || !result.ok) {
            throw new Error(result.description || 'Ошибка отправки заявки');
        }

        showSuccessMessage('✅ Заявка отправлена! Я свяжусь с вами в течение 24 часов.');
        form.reset();
        
    } catch (error) {
        console.error('Ошибка:', error);
        showErrorMessage('❌ Ошибка отправки заявки. Пожалуйста, свяжитесь со мной напрямую.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}
