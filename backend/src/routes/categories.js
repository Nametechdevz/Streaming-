const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../utils/inMemoryDB');
const { adminMiddleware, authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const db = getDB();
  const { type } = req.query;
  let cats = db.categories;
  if (type) cats = cats.filter(c => c.type === type);
  res.json(cats);
});

router.post('/', adminMiddleware, (req, res) => {
  const db = getDB();
  const { name, type, icon } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });
  const cat = { id: uuidv4(), name, type, icon: icon || '📺' };
  db.categories.push(cat);
  res.status(201).json(cat);
});

router.put('/:id', adminMiddleware, (req, res) => {
  const db = getDB();
  const cat = db.categories.find(c => c.id === req.params.id);
  if (!cat) return res.status(404).json({ error: 'Category not found' });
  Object.assign(cat, req.body);
  res.json(cat);
});

router.delete('/:id', adminMiddleware, (req, res) => {
  const db = getDB();
  const index = db.categories.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Category not found' });
  db.categories.splice(index, 1);
  res.json({ message: 'Category deleted' });
});

module.exports = router;
