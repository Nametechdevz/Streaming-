const express = require('express');
const { getDB } = require('../utils/inMemoryDB');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', adminMiddleware, (req, res) => {
  const db = getDB();
  const now = new Date();

  const activeUsers = db.users.filter(u => u.isActive && u.role !== 'admin').length;
  const expiredUsers = db.users.filter(u => u.expiresAt && new Date(u.expiresAt) < now).length;
  const totalUsers = db.users.filter(u => u.role !== 'admin').length;

  res.json({
    stats: {
      totalUsers,
      activeUsers,
      expiredUsers,
      disabledUsers: db.users.filter(u => !u.isActive && u.role !== 'admin').length,
      totalStreams: db.streams.length,
      totalMovies: db.movies.length,
      totalSeries: db.series.length,
      totalCategories: db.categories.length,
      totalDnsConfigs: db.dnsConfigs.length,
      activeDnsConfigs: db.dnsConfigs.filter(d => d.isActive).length
    },
    recentUsers: db.users
      .filter(u => u.role !== 'admin')
      .slice(-5)
      .map(({ password, ...u }) => u)
      .reverse()
  });
});

module.exports = router;
