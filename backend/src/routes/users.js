const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../utils/inMemoryDB');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - List all users (admin)
router.get('/', adminMiddleware, (req, res) => {
  const db = getDB();
  const users = db.users.map(({ password, ...u }) => u);
  res.json({ users, total: users.length });
});

// GET /api/users/:id
router.get('/:id', adminMiddleware, (req, res) => {
  const db = getDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// POST /api/users - Create user
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { username, password, email, role = 'user', maxConnections = 1, expiresAt } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = getDB();
    if (db.users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      email: email || '',
      role,
      isActive: true,
      maxConnections,
      expiresAt: expiresAt || null,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const index = db.users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });

    const { password, username, ...updates } = req.body;
    if (username && username !== db.users[index].username) {
      if (db.users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      db.users[index].username = username;
    }

    if (password) {
      db.users[index].password = await bcrypt.hash(password, 10);
    }

    Object.assign(db.users[index], updates);
    const { password: _, ...userWithoutPassword } = db.users[index];
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', adminMiddleware, (req, res) => {
  const db = getDB();
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  if (db.users[index].role === 'admin') {
    return res.status(403).json({ error: 'Cannot delete admin user' });
  }
  db.users.splice(index, 1);
  res.json({ message: 'User deleted successfully' });
});

// PATCH /api/users/:id/toggle - Toggle user active status
router.patch('/:id/toggle', adminMiddleware, (req, res) => {
  const db = getDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.isActive = !user.isActive;
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

module.exports = router;
