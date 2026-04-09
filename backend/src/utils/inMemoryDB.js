const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// In-memory database (replace with MongoDB in production)
const db = {
  users: [],
  dnsConfigs: [],
  streams: [],
  categories: [],
  movies: [],
  series: [],
  episodes: []
};

const initDB = () => {
  // Default admin user
  const adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
  db.users.push({
    id: uuidv4(),
    username: process.env.ADMIN_USERNAME || 'admin',
    password: adminPassword,
    email: 'admin@iptv.local',
    role: 'admin',
    isActive: true,
    maxConnections: 999,
    expiresAt: null,
    createdAt: new Date().toISOString()
  });

  // Default DNS config
  db.dnsConfigs.push({
    id: uuidv4(),
    name: 'Default Server',
    type: 'xtream',
    host: 'http://example-iptv.com',
    port: 8080,
    username: 'demo_user',
    password: 'demo_pass',
    isActive: true,
    createdAt: new Date().toISOString()
  });

  // Sample categories
  const liveId = uuidv4();
  const movieId = uuidv4();
  const seriesId = uuidv4();

  db.categories.push(
    { id: liveId, name: 'Sports', type: 'live', icon: '⚽' },
    { id: uuidv4(), name: 'News', type: 'live', icon: '📰' },
    { id: uuidv4(), name: 'Entertainment', type: 'live', icon: '🎭' },
    { id: uuidv4(), name: 'Music', type: 'live', icon: '🎵' },
    { id: movieId, name: 'Action', type: 'movie', icon: '💥' },
    { id: uuidv4(), name: 'Comedy', type: 'movie', icon: '😂' },
    { id: uuidv4(), name: 'Drama', type: 'movie', icon: '🎬' },
    { id: uuidv4(), name: 'Horror', type: 'movie', icon: '👻' },
    { id: seriesId, name: 'Sci-Fi', type: 'series', icon: '🚀' },
    { id: uuidv4(), name: 'Thriller', type: 'series', icon: '🔪' }
  );

  // Sample live streams
  for (let i = 1; i <= 20; i++) {
    db.streams.push({
      id: uuidv4(),
      num: i,
      name: `Channel ${i}`,
      streamType: 'live',
      streamIcon: `https://via.placeholder.com/100x60/1a1a2e/ffffff?text=CH${i}`,
      epgChannelId: `channel${i}`,
      added: Date.now(),
      categoryId: db.categories.filter(c => c.type === 'live')[i % 4]?.id,
      customSid: '',
      tvArchive: 0,
      directSource: '',
      tvArchiveDuration: 0
    });
  }

  // Sample movies
  const movieTitles = [
    'Galactic Wars', 'Dark Horizon', 'The Last Stand', 'Neon City',
    'Shadow Protocol', 'Iron Fist', 'Crimson Tide', 'Frozen Planet',
    'The Awakening', 'Cyber Storm', 'Blood Moon', 'Silent Thunder',
    'Steel Wings', 'Ocean Deep', 'Fire Force', 'Desert Eagle',
    'Night Crawler', 'Time Warp', 'Void Runner', 'Star Chaser'
  ];

  movieTitles.forEach((title, i) => {
    db.movies.push({
      id: uuidv4(),
      num: i + 1,
      name: title,
      streamType: 'movie',
      streamIcon: `https://via.placeholder.com/200x300/16213e/ffffff?text=${encodeURIComponent(title)}`,
      rating: (Math.random() * 4 + 6).toFixed(1),
      rating5based: (Math.random() * 2 + 3).toFixed(1),
      added: Date.now() - i * 86400000,
      categoryId: db.categories.filter(c => c.type === 'movie')[i % 4]?.id,
      containerExtension: 'mkv',
      customSid: '',
      directSource: '',
      year: 2020 + Math.floor(Math.random() * 5),
      genre: ['Action', 'Drama', 'Sci-Fi', 'Thriller'][i % 4],
      plot: `An epic tale of ${title.toLowerCase()} that will keep you on the edge of your seat.`,
      cast: 'Actor One, Actor Two, Actor Three',
      director: 'Director Name',
      duration: `${Math.floor(Math.random() * 60 + 90)} min`,
      trailer: ''
    });
  });

  // Sample series
  const seriesTitles = [
    'Dark Matter', 'Quantum Realm', 'The Agency', 'Lost Signal',
    'Night Watch', 'Code Red', 'The Syndicate', 'Zero Hour',
    'Iron Protocol', 'Parallel Lives'
  ];

  seriesTitles.forEach((title, i) => {
    const seriesId = uuidv4();
    db.series.push({
      id: seriesId,
      num: i + 1,
      name: title,
      cover: `https://via.placeholder.com/200x300/0f3460/ffffff?text=${encodeURIComponent(title)}`,
      plot: `A gripping series following ${title.toLowerCase()} through unexpected twists.`,
      cast: 'Lead Actor, Supporting Actor, Guest Star',
      director: 'Series Director',
      genre: ['Sci-Fi', 'Thriller', 'Drama', 'Action'][i % 4],
      releaseDate: `${2018 + Math.floor(Math.random() * 6)}`,
      lastModified: Date.now(),
      rating: (Math.random() * 3 + 7).toFixed(1),
      rating5based: (Math.random() * 1.5 + 3.5).toFixed(1),
      backdropPath: [`https://via.placeholder.com/1280x720/0f3460/ffffff?text=${encodeURIComponent(title)}`],
      youtubeTrailer: '',
      episodeRunTime: `${Math.floor(Math.random() * 20 + 40)}`,
      categoryId: db.categories.filter(c => c.type === 'series')[i % 2]?.id,
      seasons: {}
    });

    // Add seasons and episodes
    const numSeasons = Math.floor(Math.random() * 3) + 1;
    for (let s = 1; s <= numSeasons; s++) {
      const numEpisodes = Math.floor(Math.random() * 8) + 4;
      for (let e = 1; e <= numEpisodes; e++) {
        const ep = {
          id: uuidv4(),
          episodeNum: e,
          title: `${title} S${s}E${e}`,
          containerExtension: 'mkv',
          info: {
            movieImage: `https://via.placeholder.com/300x170/0f3460/ffffff?text=S${s}E${e}`,
            plot: `Episode ${e} of Season ${s}.`,
            durationSecs: Math.floor(Math.random() * 1200 + 2400),
            duration: `${Math.floor(Math.random() * 20 + 40)} min`,
            rating: (Math.random() * 3 + 7).toFixed(1)
          },
          added: Date.now()
        };
        db.episodes.push({ ...ep, seriesId, season: s });

        if (!db.series[db.series.length - 1].seasons[s]) {
          db.series[db.series.length - 1].seasons[s] = [];
        }
        db.series[db.series.length - 1].seasons[s].push(ep);
      }
    }
  });

  console.log('✅ In-memory database initialized');
  console.log(`   Users: ${db.users.length}`);
  console.log(`   Streams: ${db.streams.length}`);
  console.log(`   Movies: ${db.movies.length}`);
  console.log(`   Series: ${db.series.length}`);
};

const getDB = () => db;

module.exports = { initDB, getDB };
