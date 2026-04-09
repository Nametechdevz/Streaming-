const express = require('express');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { getDB } = require('../utils/inMemoryDB');
const { adminMiddleware, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/dns - List DNS configs
router.get('/', adminMiddleware, (req, res) => {
  const db = getDB();
  res.json({ configs: db.dnsConfigs, total: db.dnsConfigs.length });
});

// GET /api/dns/active - Get active DNS for client
router.get('/active', authMiddleware, (req, res) => {
  const db = getDB();
  const active = db.dnsConfigs.find(d => d.isActive);
  if (!active) return res.status(404).json({ error: 'No active DNS configuration' });
  // Don't expose password to regular users
  const { password, ...safeConfig } = active;
  res.json(safeConfig);
});

// POST /api/dns - Add DNS config
router.post('/', adminMiddleware, (req, res) => {
  const { name, type, host, port, username, password } = req.body;
  if (!name || !host) {
    return res.status(400).json({ error: 'Name and host are required' });
  }

  const db = getDB();
  const newConfig = {
    id: uuidv4(),
    name,
    type: type || 'xtream',
    host,
    port: port || 80,
    username: username || '',
    password: password || '',
    isActive: db.dnsConfigs.length === 0,
    createdAt: new Date().toISOString()
  };
  db.dnsConfigs.push(newConfig);
  res.status(201).json(newConfig);
});

// PUT /api/dns/:id - Update DNS config
router.put('/:id', adminMiddleware, (req, res) => {
  const db = getDB();
  const index = db.dnsConfigs.findIndex(d => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'DNS config not found' });
  Object.assign(db.dnsConfigs[index], req.body);
  res.json(db.dnsConfigs[index]);
});

// DELETE /api/dns/:id
router.delete('/:id', adminMiddleware, (req, res) => {
  const db = getDB();
  const index = db.dnsConfigs.findIndex(d => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'DNS config not found' });
  db.dnsConfigs.splice(index, 1);
  res.json({ message: 'DNS config deleted' });
});

// PATCH /api/dns/:id/activate - Set as active
router.patch('/:id/activate', adminMiddleware, (req, res) => {
  const db = getDB();
  db.dnsConfigs.forEach(d => d.isActive = false);
  const config = db.dnsConfigs.find(d => d.id === req.params.id);
  if (!config) return res.status(404).json({ error: 'DNS config not found' });
  config.isActive = true;
  res.json(config);
});

// POST /api/dns/:id/test - Test connection
router.post('/:id/test', adminMiddleware, async (req, res) => {
  const db = getDB();
  const config = db.dnsConfigs.find(d => d.id === req.params.id);
  if (!config) return res.status(404).json({ error: 'DNS config not found' });

  try {
    const url = `${config.host}:${config.port}/player_api.php?username=${config.username}&password=${config.password}&action=get_live_categories`;
    const response = await axios.get(url, { timeout: 5000 });
    res.json({ success: true, message: 'Connection successful', statusCode: response.status });
  } catch (err) {
    res.json({ success: false, message: err.message || 'Connection failed' });
  }
});

// POST /api/dns/import-m3u - Import from M3U URL
router.post('/import-m3u', adminMiddleware, async (req, res) => {
  const { url, name } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const db = getDB();
    const newConfig = {
      id: uuidv4(),
      name: name || 'Imported M3U',
      type: 'm3u',
      host: url,
      port: 80,
      username: '',
      password: '',
      isActive: db.dnsConfigs.length === 0,
      createdAt: new Date().toISOString()
    };
    db.dnsConfigs.push(newConfig);
    res.status(201).json({ success: true, config: newConfig });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import M3U' });
  }
});

module.exports = router;
