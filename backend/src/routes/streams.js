const express = require('express');
const { getDB } = require('../utils/inMemoryDB');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET /api/streams/live - Get live channels
router.get('/live', authMiddleware, (req, res) => {
  const db = getDB();
  const { category, search, page = 1, limit = 50 } = req.query;
  let streams = [...db.streams];

  if (category) streams = streams.filter(s => s.categoryId === category);
  if (search) streams = streams.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const total = streams.length;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const paginated = streams.slice(offset, offset + parseInt(limit));

  res.json({ streams: paginated, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/streams/movies - Get movies
router.get('/movies', authMiddleware, (req, res) => {
  const db = getDB();
  const { category, search, page = 1, limit = 20 } = req.query;
  let movies = [...db.movies];

  if (category) movies = movies.filter(m => m.categoryId === category);
  if (search) movies = movies.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const total = movies.length;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const paginated = movies.slice(offset, offset + parseInt(limit));

  res.json({ movies: paginated, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/streams/movies/:id - Get movie details
router.get('/movies/:id', authMiddleware, (req, res) => {
  const db = getDB();
  const movie = db.movies.find(m => m.id === req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
});

// GET /api/streams/series - Get series
router.get('/series', authMiddleware, (req, res) => {
  const db = getDB();
  const { category, search, page = 1, limit = 20 } = req.query;
  let series = db.series.map(({ seasons, ...s }) => s);

  if (category) series = series.filter(s => s.categoryId === category);
  if (search) series = series.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const total = series.length;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const paginated = series.slice(offset, offset + parseInt(limit));

  res.json({ series: paginated, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/streams/series/:id - Get series details with episodes
router.get('/series/:id', authMiddleware, (req, res) => {
  const db = getDB();
  const series = db.series.find(s => s.id === req.params.id);
  if (!series) return res.status(404).json({ error: 'Series not found' });
  res.json(series);
});

// GET /api/streams/live/:id/url - Get stream URL
router.get('/live/:id/url', authMiddleware, (req, res) => {
  const db = getDB();
  const stream = db.streams.find(s => s.id === req.params.id);
  if (!stream) return res.status(404).json({ error: 'Stream not found' });

  const activeConfig = db.dnsConfigs.find(d => d.isActive);
  if (!activeConfig) return res.status(404).json({ error: 'No active DNS config' });

  const user = req.user;
  const streamUrl = `${activeConfig.host}:${activeConfig.port}/live/${user.username}/${user.id}/${stream.num}.ts`;

  res.json({ url: streamUrl, stream });
});

// GET /api/streams/movies/:id/url - Get movie stream URL
router.get('/movies/:id/url', authMiddleware, (req, res) => {
  const db = getDB();
  const movie = db.movies.find(m => m.id === req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  const activeConfig = db.dnsConfigs.find(d => d.isActive);
  if (!activeConfig) return res.status(404).json({ error: 'No active DNS config' });

  const user = req.user;
  const streamUrl = `${activeConfig.host}:${activeConfig.port}/movie/${user.username}/${user.id}/${movie.num}.${movie.containerExtension}`;

  res.json({ url: streamUrl, movie });
});

// GET /api/streams/series/:seriesId/episode/:episodeId/url
router.get('/series/:seriesId/episode/:episodeId/url', authMiddleware, (req, res) => {
  const db = getDB();
  const series = db.series.find(s => s.id === req.params.seriesId);
  if (!series) return res.status(404).json({ error: 'Series not found' });

  const episode = db.episodes.find(e => e.id === req.params.episodeId);
  if (!episode) return res.status(404).json({ error: 'Episode not found' });

  const activeConfig = db.dnsConfigs.find(d => d.isActive);
  if (!activeConfig) return res.status(404).json({ error: 'No active DNS config' });

  const user = req.user;
  const streamUrl = `${activeConfig.host}:${activeConfig.port}/series/${user.username}/${user.id}/${episode.id}.${episode.containerExtension}`;

  res.json({ url: streamUrl, episode });
});

// Admin: Add stream
router.post('/live', adminMiddleware, (req, res) => {
  const db = getDB();
  const newStream = {
    id: uuidv4(),
    num: db.streams.length + 1,
    ...req.body,
    streamType: 'live',
    added: Date.now()
  };
  db.streams.push(newStream);
  res.status(201).json(newStream);
});

// Admin: Delete stream
router.delete('/live/:id', adminMiddleware, (req, res) => {
  const db = getDB();
  const index = db.streams.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Stream not found' });
  db.streams.splice(index, 1);
  res.json({ message: 'Stream deleted' });
});

module.exports = router;
