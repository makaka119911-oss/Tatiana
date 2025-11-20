// Backend server for Tatiana archive system
// Secure version with PostgreSQL database
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize database tables
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        registration_id VARCHAR(255) UNIQUE NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        phone VARCHAR(20) NOT NULL,
        telegram VARCHAR(255) NOT NULL,
        photo_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_results (
        id SERIAL PRIMARY KEY,
        registration_id VARCHAR(255) NOT NULL UNIQUE,
        test_data JSONB,
        libido_level VARCHAR(50),
        score INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (registration_id) REFERENCES registrations(registration_id)
      );
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

initializeDatabase();

// OPTIONS for preflight
app.options('*', cors());

// POST /api/register - Save registration
app.post('/api/register', upload.single('photo'), async (req, res) => {
  let client;
  try {
    console.log('📝 Register request received');
    const { lastName, firstName, age, phone, telegram } = req.body;

    if (!lastName || !firstName || !age || !phone || !telegram) {
      console.log('❌ Missing fields');
      return res.status(400).json({ 
        success: false,
        error: 'All fields required' 
      });
    }

    client = await pool.connect();
    
    const registrationId = Date.now().toString();
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await client.query(
      `INSERT INTO registrations 
       (registration_id, last_name, first_name, age, phone, telegram, photo_path) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [registrationId, lastName, firstName, parseInt(age), phone, telegram, photoPath]
    );

    console.log('✅ Registration saved:', registrationId);

    res.json({
      success: true,
      registrationId: registrationId,
      id: registrationId,
      message: 'Registration saved successfully'
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  } finally {
    if (client) client.release();
  }
});

// POST /api/test-result - Save test results
app.post('/api/test-result', async (req, res) => {
  let client;
  try {
    console.log('📊 Test result request received');
    const { registrationId, testData, level, score } = req.body;

    if (!registrationId) {
      return res.status(400).json({ 
        success: false,
        error: 'registrationId required' 
      });
    }

    client = await pool.connect();

    // Check if registration exists
    const regCheck = await client.query(
      'SELECT * FROM registrations WHERE registration_id = $1',
      [registrationId]
    );

    if (regCheck.rows.length === 0) {
      console.log('❌ Registration not found:', registrationId);
      return res.status(404).json({ 
        success: false,
        error: 'Registration not found' 
      });
    }

    // Save or update test results
    const result = await client.query(
      `INSERT INTO test_results 
       (registration_id, test_data, libido_level, score) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (registration_id) DO UPDATE SET 
       test_data = $2, libido_level = $3, score = $4, created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [registrationId, JSON.stringify(testData || {}), level, score]
    );

    console.log('✅ Test results saved for:', registrationId);

    res.json({
      success: true,
      message: 'Test results saved successfully'
    });

  } catch (error) {
    console.error('❌ Test result error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  } finally {
    if (client) client.release();
  }
});

// GET /api/archive - Get complete archive (requires authentication)
app.get('/api/archive', async (req, res) => {
  let client;
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    // Validate token from environment
    if (!token || token !== process.env.ARCHIVE_TOKEN) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or missing authentication token' 
      });
    }

    client = await pool.connect();

    const query = `
      SELECT 
        r.registration_id as id,
        r.last_name,
        r.first_name,
        r.age,
        r.phone,
        r.telegram,
        r.photo_path,
        r.created_at,
        t.libido_level,
        t.score,
        t.test_data
      FROM registrations r
      LEFT JOIN test_results t ON r.registration_id = t.registration_id
      WHERE t.libido_level IS NOT NULL AND t.score IS NOT NULL
      ORDER BY r.created_at DESC
    `;

    const results = await client.query(query);

    const archive = results.rows.map(row => ({
      id: row.id,
      lastName: row.last_name,
      firstName: row.first_name,
      age: row.age,
      phone: row.phone,
      telegram: row.telegram,
      photoPath: row.photo_path,
      libidoLevel: row.libido_level,
      score: row.score,
      registeredAt: row.created_at
    }));

    res.json({
      success: true,
      count: archive.length,
      archive: archive
    });

  } catch (error) {
    console.error('❌ Archive error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  } finally {
    if (client) client.release();
  }
});

// GET /api/archive/search - Search archive by surname or libido level
app.get('/api/archive/search', async (req, res) => {
  let client;
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token || token !== process.env.ARCHIVE_TOKEN) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or missing authentication token' 
      });
    }

    const { surname, libidoLevel } = req.query;

    client = await pool.connect();

    let query = `
      SELECT 
        r.registration_id as id,
        r.last_name,
        r.first_name,
        r.age,
        r.phone,
        r.telegram,
        r.photo_path,
        r.created_at,
        t.libido_level,
        t.score
      FROM registrations r
      LEFT JOIN test_results t ON r.registration_id = t.registration_id
      WHERE t.libido_level IS NOT NULL AND t.score IS NOT NULL
    `;

    const params = [];

    if (surname) {
      query += ` AND r.last_name ILIKE $${params.length + 1}`;
      params.push(`%${surname}%`);
    }

    if (libidoLevel) {
      query += ` AND t.libido_level ILIKE $${params.length + 1}`;
      params.push(`%${libidoLevel}%`);
    }

    query += ' ORDER BY r.created_at DESC';

    const results = await client.query(query, params);

    res.json({
      success: true,
      count: results.rows.length,
      results: results.rows.map(row => ({
        id: row.id,
        lastName: row.last_name,
        firstName: row.first_name,
        age: row.age,
        libidoLevel: row.libido_level,
        score: row.score
      }))
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  } finally {
    if (client) client.release();
  }
});

// GET /api/health - Server health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM registrations');
    res.json({
      status: 'ok',
      database: 'connected',
      registrations: parseInt(result.rows[0].count),
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Static files
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

module.exports = app;
