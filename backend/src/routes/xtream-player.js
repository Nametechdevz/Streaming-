/**
 * Xtream Codes Compatible Player API
 * Endpoint: /player_api.php
 * Compatible with all IPTV players that support Xtream Codes protocol
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { getDB } = require('../utils/inMemoryDB');

const router = express.Router();

const authenticate = async (username, password) => {
  const db = getDB();
  const user = db.users.find(u => u.username === username);
  if (!user || !user.isActive) return null;
  if (user.expiresAt && new Date(user.expiresAt) < new Date()) return null;
  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch ? user : null;
};

const handleRequest = async (req, res) => {
  const params = { ...req.query, ...req.body };
  const { username, password, action, category_id, vod_id, series_id, stream_id } = params;

  if (!username || !password) {
    return res.status(401).json({ user_info: { auth: 0 } });
  }

  const user = await authenticate(username, password);
  if (!user) {
    return res.status(401).json({ user_info: { auth: 0, message: 'Invalid credentials' } });
  }

  const db = getDB();
  const activeConfig = db.dnsConfigs.find(d => d.isActive);

  const serverInfo = {
    url: activeConfig?.host || req.protocol + '://' + req.get('host'),
    port: String(activeConfig?.port || 5000),
    https_port: '443',
    server_protocol: 'http',
    rtmp_port: '1935',
    timestamp_now: Math.floor(Date.now() / 1000),
    time_now: new Date().toISOString(),
    timezone: 'UTC'
  };

  const userInfo = {
    username: user.username,
    password: '****',
    message: 'Welcome',
    auth: 1,
    status: 'Active',
    exp_date: user.expiresAt ? String(Math.floor(new Date(user.expiresAt) / 1000)) : null,
    is_trial: '0',
    active_cons: '0',
    created_at: user.createdAt,
    max_connections: String(user.maxConnections),
    allowed_output_formats: ['ts', 'rtmp', 'm3u8']
  };

  switch (action) {
    case 'get_live_categories':
      return res.json(db.categories.filter(c => c.type === 'live').map(c => ({
        category_id: c.id, category_name: c.name, parent_id: 0
      })));

    case 'get_vod_categories':
      return res.json(db.categories.filter(c => c.type === 'movie').map(c => ({
        category_id: c.id, category_name: c.name, parent_id: 0
      })));

    case 'get_series_categories':
      return res.json(db.categories.filter(c => c.type === 'series').map(c => ({
        category_id: c.id, category_name: c.name, parent_id: 0
      })));

    case 'get_live_streams': {
      let streams = db.streams;
      if (category_id) streams = streams.filter(s => s.categoryId === category_id);
      return res.json(streams.map(s => ({
        num: s.num,
        name: s.name,
        stream_type: 'live',
        stream_id: s.id,
        stream_icon: s.streamIcon,
        epg_channel_id: s.epgChannelId,
        added: String(s.added),
        category_id: s.categoryId,
        custom_sid: s.customSid,
        tv_archive: s.tvArchive,
        direct_source: s.directSource,
        tv_archive_duration: s.tvArchiveDuration
      })));
    }

    case 'get_vod_streams': {
      let movies = db.movies;
      if (category_id) movies = movies.filter(m => m.categoryId === category_id);
      return res.json(movies.map(m => ({
        num: m.num,
        name: m.name,
        stream_type: 'movie',
        stream_id: m.id,
        stream_icon: m.streamIcon,
        rating: m.rating,
        rating_5based: m.rating5based,
        added: String(m.added),
        category_id: m.categoryId,
        container_extension: m.containerExtension,
        custom_sid: m.customSid,
        direct_source: m.directSource
      })));
    }

    case 'get_series': {
      let series = db.series;
      if (category_id) series = series.filter(s => s.categoryId === category_id);
      return res.json(series.map(({ seasons, ...s }) => ({
        num: s.num,
        name: s.name,
        series_id: s.id,
        cover: s.cover,
        plot: s.plot,
        cast: s.cast,
        director: s.director,
        genre: s.genre,
        release_date: s.releaseDate,
        last_modified: String(s.lastModified),
        rating: s.rating,
        rating_5based: s.rating5based,
        backdrop_path: s.backdropPath,
        youtube_trailer: s.youtubeTrailer,
        episode_run_time: s.episodeRunTime,
        category_id: s.categoryId
      })));
    }

    case 'get_series_info': {
      if (!series_id) return res.status(400).json({ error: 'series_id required' });
      const series = db.series.find(s => s.id === series_id);
      if (!series) return res.status(404).json({ error: 'Series not found' });

      const episodes = {};
      Object.entries(series.seasons).forEach(([season, eps]) => {
        episodes[season] = eps.map(e => ({
          id: e.id,
          episode_num: e.episodeNum,
          title: e.title,
          container_extension: e.containerExtension,
          info: e.info,
          added: String(e.added),
          season: season
        }));
      });

      return res.json({
        seasons: Object.keys(series.seasons).map(s => ({
          air_date: '',
          episode_count: series.seasons[s].length,
          id: parseInt(s),
          name: `Season ${s}`,
          overview: '',
          season_number: parseInt(s),
          cover: series.cover,
          cover_big: series.cover
        })),
        info: {
          name: series.name,
          cover: series.cover,
          plot: series.plot,
          cast: series.cast,
          director: series.director,
          genre: series.genre,
          release_date: series.releaseDate,
          last_modified: String(series.lastModified),
          rating: series.rating,
          rating_5based: series.rating5based,
          backdrop_path: series.backdropPath,
          youtube_trailer: series.youtubeTrailer,
          episode_run_time: series.episodeRunTime,
          category_id: series.categoryId
        },
        episodes
      });
    }

    case 'get_vod_info': {
      if (!vod_id) return res.status(400).json({ error: 'vod_id required' });
      const movie = db.movies.find(m => m.id === vod_id);
      if (!movie) return res.status(404).json({ error: 'Movie not found' });
      return res.json({
        info: {
          kinopoisk_url: '',
          tmdb_id: '',
          name: movie.name,
          o_name: movie.name,
          cover_big: movie.streamIcon,
          movie_image: movie.streamIcon,
          releasedate: String(movie.year),
          episode_run_time: movie.duration,
          youtube_trailer: movie.trailer,
          director: movie.director,
          actors: movie.cast,
          cast: movie.cast,
          description: movie.plot,
          plot: movie.plot,
          age: 'PG-13',
          country: 'USA',
          genre: movie.genre,
          duration_secs: 7200,
          duration: movie.duration,
          bitrate: 0,
          rating: movie.rating,
          backdrop_path: [movie.streamIcon],
          backdrop: [movie.streamIcon],
          tmdb: 0,
          trailer: movie.trailer,
          tmdb_overview: movie.plot
        },
        movie_data: {
          stream_id: movie.id,
          name: movie.name,
          added: String(movie.added),
          category_id: movie.categoryId,
          container_extension: movie.containerExtension,
          custom_sid: '',
          direct_source: ''
        }
      });
    }

    default:
      return res.json({ user_info: userInfo, server_info: serverInfo });
  }
};

router.get('/', handleRequest);
router.post('/', handleRequest);

module.exports = router;
