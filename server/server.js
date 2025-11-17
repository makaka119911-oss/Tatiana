const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
// Serve static files from the parent directory (Tatiana)
app.use(express.static(path.join(__dirname, '..'))); 

// Data file path
const DATA_FILE = path.join(__dirname, 'results_archive.json');
const ARCHIVE_PASSWORD = 'rerehepf123'; // The password provided by the user

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Helper function to read data
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        return [];
    }
}

// Helper function to write data
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing data file:', error);
    }
}

// 1. Endpoint to receive and store registration/test results
app.post('/api/archive', (req, res) => {
    const resultData = req.body;
    if (!resultData || !resultData.firstName || !resultData.email) {
        return res.status(400).json({ success: false, message: 'Missing required fields (firstName, email).' });
    }

    const newEntry = {
        _id: Date.now().toString(), // Simple unique ID
        timestamp: new Date().toISOString(),
        ...resultData
    };

    const data = readData();
    data.push(newEntry);
    writeData(data);

    console.log('New result submitted and archived:', newEntry);
    res.json({ success: true, message: 'Result successfully submitted and archived.' });
});

// 2. Endpoint for archive access (password protected)
app.post('/api/archive/login', (req, res) => {
    const { password } = req.body;
    if (password === ARCHIVE_PASSWORD) {
        // In a real application, this would issue a secure token (JWT)
        // For this simple implementation, we'll just return a success flag
        res.json({ success: true, message: 'Login successful.' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password.' });
    }
});

// 3. Endpoint to retrieve archived data (requires successful login)
// NOTE: In a real app, this should be protected by a token check.
// For this simple local server, we'll rely on the client to handle the login flow.
app.get('/api/archive', (req, res) => {
    const data = readData();
    // Send all data as the client-side logic seems to handle filtering/display
    res.json(data);
});

// 4. Endpoint to filter data (if needed by client)
app.get('/api/archive/filter/:level', (req, res) => {
    const { level } = req.params;
    const data = readData();
    const filteredData = data.filter(item => item.libidonLevel === level);
    res.json(filteredData);
});

// 5. Endpoint to delete data (if needed by client)
app.delete('/api/archive/:id', (req, res) => {
    const { id } = req.params;
    let data = readData();
    const initialLength = data.length;
    data = data.filter(item => item._id !== id);
    
    if (data.length < initialLength) {
        writeData(data);
        res.json({ success: true, message: 'User data deleted.' });
    } else {
        res.status(404).json({ success: false, message: 'User not found.' });
    }
});

// 6. Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Local server is running.' });
});


// Start the server
app.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
});
