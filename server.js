// Backend server for Tatiana website
// Secure version with PostgreSQL and proper error handling

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://makaka119911-oss.github.io',
    'https://yourdomain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload configuration - memory storage for Railway
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create registrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        registration_id VARCHAR(255) UNIQUE NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        age INTEGER NOT NULL CHECK (age >= 18 AND age <= 80),
        phone VARCHAR(50) NOT NULL,
        telegram VARCHAR(255) NOT NULL,
        photo_data TEXT,
        photo_mimetype VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create test_results table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_results (
        id SERIAL PRIMARY KEY,
        registration_id VARCHAR(255) NOT NULL UNIQUE,
        test_data JSONB NOT NULL DEFAULT '{}',
        libido_level VARCHAR(100) NOT NULL,
        score INTEGER NOT NULL CHECK (score >= 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_registration
          FOREIGN KEY(registration_id) 
          REFERENCES registrations(registration_id)
          ON DELETE CASCADE
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_test_results_level ON test_results(libido_level);
      CREATE INDEX IF NOT EXISTS idx_test_results_score ON test_results(score DESC);
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const dbResult = await pool.query('SELECT COUNT(*) as count FROM registrations');
    const registrationsCount = parseInt(dbResult.rows[0].count);
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      registrations: registrationsCount,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Debug endpoint to check database structure
app.get('/api/debug/tables', async (req, res) => {
  try {
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const registrationsCount = await pool.query('SELECT COUNT(*) FROM registrations');
    const testResultsCount = await pool.query('SELECT COUNT(*) FROM test_results');
    
    res.json({
      success: true,
      tables: tables.rows.map(row => row.table_name),
      counts: {
        registrations: parseInt(registrationsCount.rows[0].count),
        test_results: parseInt(testResultsCount.rows[0].count)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Registration endpoint
app.post('/api/register', upload.single('photo'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    console.log('📝 Registration request received');
    
    const { lastName, firstName, age, phone, telegram } = req.body;

    // Validation
    if (!lastName?.trim() || !firstName?.trim() || !age || !phone?.trim() || !telegram?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Все поля обязательны для заполнения: фамилия, имя, возраст, телефон, telegram'
      });
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 80) {
      return res.status(400).json({
        success: false,
        error: 'Возраст должен быть числом от 18 до 80 лет'
      });
    }

    // Generate unique registration ID
    const registrationId = 'T' + Date.now() + Math.random().toString(36).substr(2, 9);
    
    let photoData = null;
    let photoMimetype = null;

    // Process photo if provided
    if (req.file) {
      if (req.file.size > 10 * 1024 * 1024) {
        throw new Error('Размер файла не должен превышать 10MB');
      }
      photoData = req.file.buffer.toString('base64');
      photoMimetype = req.file.mimetype;
    }

    // Insert registration into database
    const result = await client.query(
      `INSERT INTO registrations 
       (registration_id, last_name, first_name, age, phone, telegram, photo_data, photo_mimetype) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING registration_id, created_at`,
      [registrationId, lastName.trim(), firstName.trim(), ageNum, phone.trim(), telegram.trim(), photoData, photoMimetype]
    );

    console.log('✅ Registration saved:', registrationId);

    res.json({
      success: true,
      registrationId: registrationId,
      id: registrationId,
      message: 'Регистрация успешно сохранена',
      timestamp: result.rows[0].created_at
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // unique_violation
      return res.status(400).json({
        success: false,
        error: 'Регистрация с такими данными уже существует'
      });
    }
    
    if (error.code === '23502') { // not_null_violation
      return res.status(400).json({
        success: false,
        error: 'Не все обязательные поля заполнены'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера: ' + error.message
    });
  } finally {
    client.release();
  }
});

// Test results endpoint
app.post('/api/test-result', async (req, res) => {
  const client = await pool.connect();
  
  try {
    console.log('📊 Test result submission received');
    
    const { registrationId, testData, level, score } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        error: 'ID регистрации обязателен'
      });
    }

    if (!level || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Уровень либидо и баллы обязательны'
      });
    }

    // Check if registration exists
    const registrationCheck = await client.query(
      'SELECT registration_id FROM registrations WHERE registration_id = $1',
      [registrationId]
    );

    if (registrationCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Регистрация не найдена. Пожалуйста, пройдите регистрацию сначала.'
      });
    }

    // Insert or update test results
    const result = await client.query(
      `INSERT INTO test_results (registration_id, test_data, libido_level, score)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (registration_id) 
       DO UPDATE SET 
         test_data = EXCLUDED.test_data,
         libido_level = EXCLUDED.libido_level,
         score = EXCLUDED.score,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [registrationId, testData || {}, level, parseInt(score)]
    );

    console.log('✅ Test results saved for:', registrationId);

    res.json({
      success: true,
      message: 'Результаты теста успешно сохранены',
      testId: result.rows[0].id,
      level: level,
      score: score
    });

  } catch (error) {
    console.error('❌ Test result error:', error);
    
    if (error.code === '23503') { // foreign_key_violation
      return res.status(400).json({
        success: false,
        error: 'Неверный ID регистрации'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка сохранения результатов: ' + error.message
    });
  } finally {
    client.release();
  }
});

// Archive endpoint with authentication
app.get('/api/archive', async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Check authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Требуется аутентификация'
      });
    }

    const token = authHeader.substring(7);
    const validToken = process.env.ARCHIVE_TOKEN;

    if (!validToken || token !== validToken) {
      return res.status(401).json({
        success: false,
        error: 'Неверный токен аутентификации'
      });
    }

    // Get complete archive with test results
    const archiveQuery = `
      SELECT 
        r.registration_id as id,
        r.last_name as "lastName",
        r.first_name as "firstName", 
        r.age,
        r.phone,
        r.telegram,
        r.photo_data as "photoData",
        r.photo_mimetype as "photoMimetype",
        r.created_at as "registeredAt",
        t.libido_level as "libidoLevel",
        t.score,
        t.test_data as "testData",
        t.created_at as "testCompletedAt"
      FROM registrations r
      INNER JOIN test_results t ON r.registration_id = t.registration_id
      ORDER BY r.created_at DESC
    `;

    const result = await client.query(archiveQuery);
    
    const archive = result.rows.map(row => ({
      id: row.id,
      lastName: row.lastName,
      firstName: row.firstName,
      age: row.age,
      phone: row.phone,
      telegram: row.telegram,
      hasPhoto: !!row.photoData,
      libidoLevel: row.libidoLevel,
      score: row.score,
      registeredAt: row.registeredAt,
      testCompletedAt: row.testCompletedAt
    }));

    console.log('📁 Archive accessed, records:', archive.length);

    res.json({
      success: true,
      count: archive.length,
      archive: archive,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Archive error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка доступа к архиву: ' + error.message
    });
  } finally {
    client.release();
  }
});

// Search archive endpoint
app.get('/api/archive/search', async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Authentication check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Требуется аутентификация'
      });
    }

    const token = authHeader.substring(7);
    if (token !== process.env.ARCHIVE_TOKEN) {
      return res.status(401).json({
        success: false,
        error: 'Неверный токен аутентификации'
      });
    }

    const { surname, level } = req.query;
    
    let searchQuery = `
      SELECT 
        r.registration_id as id,
        r.last_name as "lastName",
        r.first_name as "firstName",
        r.age,
        r.phone,
        r.telegram,
        t.libido_level as "libidoLevel",
        t.score,
        r.created_at as "registeredAt"
      FROM registrations r
      INNER JOIN test_results t ON r.registration_id = t.registration_id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 0;

    if (surname) {
      paramCount++;
      searchQuery += ` AND r.last_name ILIKE $${paramCount}`;
      queryParams.push(`%${surname}%`);
    }

    if (level) {
      paramCount++;
      searchQuery += ` AND t.libido_level ILIKE $${paramCount}`;
      queryParams.push(`%${level}%`);
    }

    searchQuery += ' ORDER BY r.created_at DESC';

    const result = await client.query(searchQuery, queryParams);

    res.json({
      success: true,
      count: result.rows.length,
      results: result.rows,
      search: {
        surname: surname,
        level: level
      }
    });

  } catch (error) {
    console.error('❌ Archive search error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка поиска: ' + error.message
    });
  } finally {
    client.release();
  }
});

// Simple registration endpoint (without photo)
app.post('/api/simple-register', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { lastName, firstName, age, phone, telegram } = req.body;

    if (!lastName || !firstName || !age || !phone || !telegram) {
      return res.status(400).json({
        success: false,
        error: 'Все поля обязательны'
      });
    }

    const registrationId = 'S' + Date.now();
    
    await client.query(
      `INSERT INTO registrations 
       (registration_id, last_name, first_name, age, phone, telegram) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [registrationId, lastName, firstName, parseInt(age), phone, telegram]
    );

    res.json({
      success: true,
      registrationId: registrationId,
      message: 'Упрощенная регистрация успешна'
    });

  } catch (error) {
    console.error('Simple register error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Размер файла слишком большой. Максимум 10MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log('🚀 Server started successfully');
      console.log('📍 Port:', PORT);
      console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
      console.log('🗄️ Database: Connected to PostgreSQL');
      console.log('🔐 Archive token:', process.env.ARCHIVE_TOKEN ? 'Set' : 'Not set');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
