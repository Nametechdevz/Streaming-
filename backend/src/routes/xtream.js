const express = require('express');
const { getDB } = require('../utils/inMemoryDB');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/xtream/categories/:type
router.get('/categories/:type', authMiddleware, (req, res) => {
  const db = getDB();
  const type = req.params.type; // live | movie | series
  const categories = db.categories.filter(c => c.type === type);
  res.json(categories);
});

// GET /api/xtream/server-info
router.get('/server-info', authMiddleware, (req, res) => {
  const db = getDB();
  const activeConfig = db.dnsConfigs.find(d => d.isActive);

  res.json({
    server_info: {
      url: activeConfig?.host || 'http://localhost:5000',
      port: String(activeConfig?.port || 5000),
      https_port: '443',
      server_protocol: 'http',
      rtmp_port: '1935',
      timestamp_now: Math.floor(Date.now() / 1000),
      time_now: new Date().toISOString(),
      timezone: 'UTC'
    },
    user_info: {
      username: req.user.username,
      password: '****',
      message: 'Welcome to IPTV Platform',
      auth: 1,
      status: req.user.isActive ? 'Active' : 'Disabled',
      exp_date: req.user.expiresAt ? Math.floor(new Date(req.user.expiresAt) / 1000) : null,
      is_trial: '0',
      active_cons: '0',
      created_at: req.user.createdAt,
      max_connections: String(req.user.maxConnections),
      allowed_output_formats: ['ts', 'rtmp', 'm3u8']
    }
  });
});

module.exports = router;
