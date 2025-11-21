const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fetch = require('node-fetch'); // Добавьте эту зависимость

const app = express();

// Middleware
app.use(cors({
  origin: ['https://makaka119911-oss.github.io', 'http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Telegram configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Функция отправки в Telegram
async function sendToTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram credentials not configured');
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const result = await response.json();
    if (!result.ok) {
      console.error('Telegram API error:', result);
    } else {
      console.log('Message sent to Telegram');
    }
  } catch (error) {
    console.error('Error sending to Telegram:', error);
  }
}

// Health endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      message: 'Server is working!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  console.log('📝 Registration request received');
  
  try {
    const { lastName, firstName, age, phone, telegram } = req.body;

    // Validation
    if (!lastName || !firstName || !age || !phone || !telegram) {
      return res.status(400).json({
        success: false,
        error: 'Все поля обязательны'
      });
    }

    const registrationId = 'T' + Date.now();
    
    // Save to database
    await pool.query(
      `INSERT INTO registrations 
       (registration_id, last_name, first_name, age, phone, telegram) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [registrationId, lastName, firstName, parseInt(age), phone, telegram]
    );

    console.log('✅ Registration saved:', registrationId);

    // Send to Telegram
    const telegramMessage = `
🎉 <b>НОВАЯ РЕГИСТРАЦИЯ</b>

👤 <b>Имя:</b> ${firstName} ${lastName}
📅 <b>Возраст:</b> ${age}
📞 <b>Телефон:</b> ${phone}
✈️ <b>Telegram:</b> ${telegram}

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
🆔 <b>ID:</b> ${registrationId}
    `;

    await sendToTelegram(telegramMessage);

    res.json({
      success: true,
      registrationId: registrationId,
      message: 'Регистрация успешна!'
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера: ' + error.message
    });
  }
});

// Test results endpoint
app.post('/api/test-result', async (req, res) => {
  console.log('📊 Test results request received');
  
  try {
    const { registrationId, testData, level, score } = req.body;

    if (!registrationId || !level) {
      return res.status(400).json({
        success: false,
        error: 'Отсутствуют обязательные данные'
      });
    }

    // Save test results
    await pool.query(
      `INSERT INTO test_results 
       (registration_id, test_data, libido_level, score) 
       VALUES ($1, $2, $3, $4)`,
      [registrationId, JSON.stringify(testData), level, score]
    );

    console.log('✅ Test results saved for:', registrationId);

    // Get user info for Telegram
    const userResult = await pool.query(
      'SELECT * FROM registrations WHERE registration_id = $1',
      [registrationId]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      
      const telegramMessage = `
📊 <b>НОВЫЕ РЕЗУЛЬТАТЫ ТЕСТА</b>

👤 <b>Пользователь:</b> ${user.first_name} ${user.last_name}
📞 <b>Телефон:</b> ${user.phone}
✈️ <b>Telegram:</b> ${user.telegram}

📈 <b>Уровень либидо:</b> ${level}
⭐ <b>Баллы:</b> ${score}

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
      `;

      await sendToTelegram(telegramMessage);
    }

    res.json({
      success: true,
      message: 'Результаты теста сохранены!'
    });

  } catch (error) {
    console.error('❌ Test results error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сохранения результатов: ' + error.message
    });
  }
});

// Archive endpoint
app.get('/api/archive', async (req, res) => {
  console.log('📁 Archive access request');
  
  try {
    // Check authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const expectedToken = process.env.ARCHIVE_TOKEN;

    if (token !== expectedToken) {
      return res.status(401).json({
        success: false,
        error: 'Неверный токен доступа'
      });
    }

    // Get archive data with JOIN
    const result = await pool.query(`
      SELECT 
        r.registration_id,
        r.last_name,
        r.first_name,
        r.age,
        r.phone,
        r.telegram,
        r.created_at as registered_at,
        t.libido_level,
        t.score,
        t.created_at as tested_at
      FROM registrations r
      LEFT JOIN test_results t ON r.registration_id = t.registration_id
      ORDER BY r.created_at DESC
    `);

    console.log('📊 Archive data retrieved:', result.rows.length, 'records');

    res.json({
      success: true,
      archive: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Archive error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка доступа к архиву: ' + error.message
    });
  }
});

// Initialize database
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        registration_id VARCHAR(255) UNIQUE NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        age INTEGER NOT NULL,
        phone VARCHAR(50) NOT NULL,
        telegram VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_results (
        id SERIAL PRIMARY KEY,
        registration_id VARCHAR(255) UNIQUE NOT NULL,
        test_data JSONB DEFAULT '{}',
        libido_level VARCHAR(100) NOT NULL,
        score INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database init error:', error);
  }
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Telegram configured: ${!!TELEGRAM_BOT_TOKEN}`);
  await initializeDatabase();
});
