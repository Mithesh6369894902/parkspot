require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/lands', require('./routes/land'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/seed', require('./routes/seed'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Serve React frontend in production (only if built)
const clientBuild = path.join(__dirname, '../../client/dist');
const fs = require('fs');
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.json({ message: 'ParkSpot API is running', docs: '/api/health' }));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`ParkSpot server running on port ${PORT}`));
