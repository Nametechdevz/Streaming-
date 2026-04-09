import React, { useEffect, useState } from 'react';
import { streamsAPI, categoriesAPI } from '../utils/api';

export default function StreamsPage() {
  const [tab, setTab] = useState('live');
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    setSearch('');
    setCatFilter('');
    const typeMap = { live: 'live', movies: 'movie', series: 'series' };
    Promise.all([
      tab === 'live' ? streamsAPI.live() :
        tab === 'movies' ? streamsAPI.movies() : streamsAPI.series(),
      categoriesAPI.list(typeMap[tab])
    ]).then(([content, cats]) => {
      setData(content[tab] || content.movies || content.series || []);
      setCategories(cats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [tab]);

  const filtered = data.filter(item => {
    const name = item.name || '';
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || item.categoryId === catFilter;
    return matchSearch && matchCat;
  });

  const getCatName = (id) => categories.find(c => c.id === id)?.name || '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Content Library</div>
          <div className="page-desc">{data.length} items in this category</div>
        </div>
      </div>

      <div className="tabs">
        {[
          { key: 'live', label: '📡 Live TV' },
          { key: 'movies', label: '🎬 Movies' },
          { key: 'series', label: '🎭 Series' }
        ].map(t => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          style={{ width: 200 }}
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ minHeight: '40vh' }}>
          <div className="loader" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">{tab === 'live' ? '📡' : tab === 'movies' ? '🎬' : '🎭'}</div>
            <h3>No content found</h3>
          </div>
        </div>
      ) : (
        <>
          {/* Grid for movies/series */}
          {(tab === 'movies' || tab === 'series') ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {filtered.map(item => (
                <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={item.streamIcon || item.cover}
                      alt={item.name}
                      style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                      onError={e => {
                        e.target.src = `https://via.placeholder.com/160x240/16213e/ffffff?text=${encodeURIComponent(item.name?.slice(0, 8))}`;
                      }}
                    />
                    {item.rating && (
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'rgba(0,0,0,0.8)', borderRadius: 6,
                        padding: '2px 6px', fontSize: 11, color: '#f6ad55', fontWeight: 700
                      }}>
                        ⭐ {item.rating}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {getCatName(item.categoryId)}
                      {item.year && ` · ${item.year}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table for live TV */
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Channel</th>
                      <th>Category</th>
                      <th>EPG ID</th>
                      <th>Archive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(stream => (
                      <tr key={stream.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{stream.num}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img
                              src={stream.streamIcon}
                              alt={stream.name}
                              style={{ width: 48, height: 32, objectFit: 'contain', borderRadius: 4, background: 'var(--bg-secondary)' }}
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                            <span style={{ fontWeight: 500 }}>{stream.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-info">{getCatName(stream.categoryId)}</span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stream.epgChannelId || '—'}</td>
                        <td>
                          <span className={`badge ${stream.tvArchive ? 'badge-success' : 'badge-muted'}`}>
                            {stream.tvArchive ? '✓' : '✗'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
