// Backend server for Tatiana archive system
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-memory storage
let archiveRecords = [];

// File upload
const upload = multer({ dest: 'uploads/' });

// OPTIONS for preflight
app.options('*', cors());

// POST /api/register - Save registration
app.post('/api/register', upload.single('photo'), (req, res) => {
  try {
    console.log('📝 Register request received');
    console.log('Body:', req.body);
    console.log('File:', req.file ? 'Yes' : 'No');
    
    const { lastName, firstName, age, phone, telegram } = req.body;
    
    if (!lastName || !firstName || !age || !phone || !telegram) {
      console.log('❌ Missing fields');
      return res.status(400).json({ error: 'All fields required' });
    }
    
    const registrationId = Date.now().toString();
    const newRecord = {
      id: registrationId,
      registrationId: registrationId,
      fio: `${lastName} ${firstName}`,
      lastName,
      firstName,
      age: parseInt(age),
      phone,
      telegram,
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      date: new Date(),
      testResult: null,
      level: null,
      score: null
    };
    
    archiveRecords.push(newRecord);
    console.log('✅ Registration saved:', registrationId);
    
    res.json({
      success: true,
      registrationId: registrationId,
      id: registrationId,
      message: 'Registration saved'
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/test-result - Save test results
app.post('/api/test-result', (req, res) => {
  try {
    console.log('📊 Test result request received');
    const { registrationId, testData, result } = req.body;
    
    console.log('Looking for registration:', registrationId);
    const record = archiveRecords.find(r => r.id === registrationId || r.registrationId === registrationId);
    
    if (!record) {
      console.log('❌ Registration not found:', registrationId);
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    record.testResult = testData;
    record.level = result?.level;
    record.score = result?.score;
    
    console.log('✅ Test results saved for:', record.fio);
    
    res.json({
      success: true,
      message: 'Test results saved'
    });
  } catch (error) {
    console.error('❌ Test result error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/archive - Get archive (password protected)
app.get('/api/archive', (req, res) => {
  try {
    const auth = req.headers.authorization;
    const password = auth?.split(' ')[1] || auth?.replace('Bearer ', '');
    
    if (password !== 'admin19191') {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const completedRecords = archiveRecords.filter(r => r.level && r.score !== null);
    
    res.json({
      success: true,
      records: completedRecords.map(r => ({
        id: r.id,
        fio: r.fio,
        age: r.age,
        phone: r.phone,
        telegram: r.telegram,
        level: r.level,
        score: r.score,
        date: r.date,
        photo: r.photo
      }))
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/health - Server health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    records: archiveRecords.length,
    timestamp: new Date()
  });
});

// Static files
app.use('/uploads', express.static('uploads'));

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
