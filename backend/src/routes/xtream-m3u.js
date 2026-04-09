/**
 * M3U Playlist Generator - Compatible with VLC, Kodi, etc.
 * Endpoint: /get.php?username=X&password=X&type=m3u_plus&output=ts
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { getDB } = require('../utils/inMemoryDB');

const router = express.Router();

router.get('/', async (req, res) => {
  const { username, password, type = 'm3u_plus', output = 'ts' } = req.query;

  if (!username || !password) {
    return res.status(401).send('#EXTM3U\n# Authentication required');
  }

  const db = getDB();
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(401).send('#EXTM3U\n# Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send('#EXTM3U\n# Invalid credentials');

  const activeConfig = db.dnsConfigs.find(d => d.isActive);
  const baseUrl = activeConfig
    ? `${activeConfig.host}:${activeConfig.port}`
    : `${req.protocol}://${req.get('host')}`;

  let m3u = `#EXTM3U url-tvg="" refresh="600"\n\n`;

  // Live streams
  db.streams.forEach(stream => {
    const category = db.categories.find(c => c.id === stream.categoryId);
    m3u += `#EXTINF:-1 tvg-id="${stream.epgChannelId}" tvg-name="${stream.name}" tvg-logo="${stream.streamIcon}" group-title="${category?.name || 'Live TV'}",${stream.name}\n`;
    m3u += `${baseUrl}/live/${username}/${user.id}/${stream.num}.${output}\n\n`;
  });

  // Movies
  db.movies.forEach(movie => {
    const category = db.categories.find(c => c.id === movie.categoryId);
    m3u += `#EXTINF:-1 tvg-id="${movie.id}" tvg-name="${movie.name}" tvg-logo="${movie.streamIcon}" group-title="${category?.name || 'Movies'}",${movie.name}\n`;
    m3u += `${baseUrl}/movie/${username}/${user.id}/${movie.num}.${movie.containerExtension}\n\n`;
  });

  // Series episodes
  db.episodes.forEach(ep => {
    const series = db.series.find(s => s.id === ep.seriesId);
    if (!series) return;
    m3u += `#EXTINF:-1 tvg-id="${ep.id}" tvg-name="${ep.title}" tvg-logo="${series.cover}" group-title="${series.name}",${ep.title}\n`;
    m3u += `${baseUrl}/series/${username}/${user.id}/${ep.id}.${ep.containerExtension}\n\n`;
  });

  res.setHeader('Content-Type', 'application/x-mpegURL');
  res.setHeader('Content-Disposition', `attachment; filename="playlist_${username}.m3u"`);
  res.send(m3u);
});

module.exports = router;
