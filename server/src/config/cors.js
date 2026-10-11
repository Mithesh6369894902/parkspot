const corsOptions = {
  origin: function (origin, callback) {
    // Allow mobile apps / curl (no origin) + explicit allowlist
    const rawList = [
      process.env.CLIENT_URL,
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean).map((s) => String(s).trim().replace(/\/$/, ''));
    if (!origin) return callback(null, true);
    const cleanOrigin = String(origin).replace(/\/$/, '');
    if (rawList.includes(cleanOrigin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
