require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const dnsRoutes = require('./routes/dns');
const streamRoutes = require('./routes/streams');
const xtreamRoutes = require('./routes/xtream');
const categoryRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dns', dnsRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/xtream', xtreamRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Xtream Codes compatible API endpoint
app.use('/player_api.php', require('./routes/xtream-player'));
app.use('/get.php', require('./routes/xtream-m3u'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', version: '1.0.0', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// In-memory DB initialization (no MongoDB needed for demo)
const { initDB } = require('./utils/inMemoryDB');
initDB();

app.listen(PORT, () => {
  console.log(`🚀 IPTV Backend running on port ${PORT}`);
  console.log(`📺 Xtream Codes API: http://localhost:${PORT}/player_api.php`);
  console.log(`🔧 Admin API: http://localhost:${PORT}/api`);
});

module.exports = app;
