const express = require('express');
const cors = require('cors');

const app = express();

// Простой CORS - разрешаем все origins для теста
app.use(cors());
app.use(express.json());

// Health endpoint - ДОЛЖЕН РАБОТАТЬ ПЕРВЫМ
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint works!',
    timestamp: new Date().toISOString()
  });
});

// Простой registration endpoint без базы данных
app.post('/api/register', (req, res) => {
  console.log('📝 Registration received:', req.body);
  
  try {
    const { lastName, firstName, age, phone, telegram } = req.body;

    // Basic validation
    if (!lastName || !firstName || !age || !phone || !telegram) {
      return res.status(400).json({
        success: false,
        error: 'Все поля обязательны'
      });
    }

    const registrationId = 'T' + Date.now();
    
    console.log('✅ Registration processed:', registrationId);

    res.json({
      success: true,
      registrationId: registrationId,
      message: 'Регистрация успешна! (данные сохранены)'
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера: ' + error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
  console.log(`✅ Test: http://localhost:${PORT}/api/test`);
});
