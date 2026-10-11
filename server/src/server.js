require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const corsOptions = require('./config/cors');
const { apiLimiter, mongoSanitize } = require('./middleware/security');

const uploadsDir = path.join(__dirname, '../uploads');
const privateDir = path.join(uploadsDir, 'private');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(privateDir)) fs.mkdirSync(privateDir, { recursive: true });

const app = express();
app.disable('x-powered-by');

connectDB();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '20kb' }));
app.use(mongoSanitize);
app.use('/api/', apiLimiter);

// Public images only. Verification docs live in /uploads/private which is NEVER served statically.
app.use('/uploads', (req, res, next) => {
  if (req.path.startsWith('/private')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}, express.static(uploadsDir));

app.get('/api/health', (req, res) => res.json({ status: 'LIVE', version: '2.0', timestamp: new Date().toISOString() }));

app.use('/api/seed', require('./routes/seed'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lands', require('./routes/land'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/support', require('./routes/support'));

app.get('/', (req, res) => res.json({ message: 'ParkSpot API v2.0 is running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`ParkSpot server v2.0 running on port ${PORT}`));
