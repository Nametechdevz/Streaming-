import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { dnsAPI } from '../utils/api';

const defaultForm = {
  name: '', type: 'xtream', host: '', port: 8080,
  username: '', password: ''
};

export default function DNSPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showM3UModal, setShowM3UModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [m3uForm, setM3UForm] = useState({ url: '', name: '' });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(null);

  const fetchConfigs = () => {
    dnsAPI.list().then(data => {
      setConfigs(data.configs);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchConfigs(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (config) => {
    setEditing(config);
    setForm({
      name: config.name,
      type: config.type,
      host: config.host,
      port: config.port,
      username: config.username || '',
      password: config.password || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await dnsAPI.update(editing.id, form);
        toast.success('DNS config updated');
      } else {
        await dnsAPI.create(form);
        toast.success('DNS config added');
      }
      setShowModal(false);
      fetchConfigs();
    } catch (err) {
      toast.error(err?.error || 'Failed to save DNS config');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (config) => {
    if (!window.confirm(`Delete "${config.name}"?`)) return;
    try {
      await dnsAPI.delete(config.id);
      toast.success('DNS config deleted');
      fetchConfigs();
    } catch (err) {
      toast.error(err?.error || 'Failed to delete');
    }
  };

  const handleActivate = async (config) => {
    try {
      await dnsAPI.activate(config.id);
      toast.success(`"${config.name}" is now active`);
      fetchConfigs();
    } catch (err) {
      toast.error('Failed to activate');
    }
  };

  const handleTest = async (config) => {
    setTesting(config.id);
    try {
      const result = await dnsAPI.test(config.id);
      if (result.success) {
        toast.success(`✅ Connection successful to "${config.name}"`);
      } else {
        toast.warning(`⚠️ Connection failed: ${result.message}`);
      }
    } catch {
      toast.error('Test failed');
    } finally {
      setTesting(null);
    }
  };

  const handleM3UImport = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dnsAPI.importM3U(m3uForm);
      toast.success('M3U playlist imported');
      setShowM3UModal(false);
      fetchConfigs();
    } catch (err) {
      toast.error(err?.error || 'Failed to import M3U');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">DNS & Servers</div>
          <div className="page-desc">Manage IPTV server connections</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setShowM3UModal(true)}>
            📋 Import M3U
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            ➕ Add Server
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.2)',
        borderRadius: 12, padding: '16px 20px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <span style={{ fontSize: 20 }}>ℹ️</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Xtream Codes Compatible</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Your IPTV API is available at <code style={{ background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 4, color: 'var(--accent)' }}>
              http://localhost:5000/player_api.php
            </code> — compatible with all major IPTV players
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ minHeight: '40vh' }}>
          <div className="loader" />
        </div>
      ) : configs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🌐</div>
            <h3>No DNS configurations</h3>
            <p>Add your first IPTV server to get started</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {configs.map(config => (
            <div key={config.id} className={`dns-card ${config.isActive ? 'active' : ''}`}>
              {config.isActive && <div className="active-indicator" />}
              <div className={`dns-type-badge ${config.type}`}>{config.type.toUpperCase()}</div>
              <div className="dns-name">{config.name}</div>
              <div className="dns-host">{config.host}</div>
              <div className="dns-meta">
                Port: {config.port}
                {config.username && <> · User: {config.username}</>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Added: {new Date(config.createdAt).toLocaleDateString()}
              </div>
              <div className="dns-actions">
                {!config.isActive && (
                  <button className="btn btn-success btn-sm" onClick={() => handleActivate(config)}>
                    ✅ Set Active
                  </button>
                )}
                {config.isActive && (
                  <span className="badge badge-success" style={{ padding: '5px 10px' }}>● Active</span>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleTest(config)}
                  disabled={testing === config.id}
                >
                  {testing === config.id ? '...' : '🔌 Test'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(config)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(config)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Server' : 'Add IPTV Server'}</div>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                      className="form-control"
                      placeholder="My IPTV Server"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-control"
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    >
                      <option value="xtream">Xtream Codes</option>
                      <option value="m3u">M3U Playlist</option>
                    </select>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Host / URL *</label>
                    <input
                      className="form-control"
                      placeholder="http://example.com"
                      value={form.host}
                      onChange={e => setForm(f => ({ ...f, host: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Port</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.port}
                      onChange={e => setForm(f => ({ ...f, port: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                {form.type === 'xtream' && (
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input
                        className="form-control"
                        value={form.username}
                        onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '...' : (editing ? 'Save Changes' : 'Add Server')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* M3U Import Modal */}
      {showM3UModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowM3UModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">📋 Import M3U Playlist</div>
              <button className="btn-close" onClick={() => setShowM3UModal(false)}>✕</button>
            </div>
            <form onSubmit={handleM3UImport}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Playlist Name</label>
                  <input
                    className="form-control"
                    placeholder="My M3U Playlist"
                    value={m3uForm.name}
                    onChange={e => setM3UForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">M3U URL *</label>
                  <input
                    className="form-control"
                    placeholder="http://example.com/playlist.m3u"
                    value={m3uForm.url}
                    onChange={e => setM3UForm(f => ({ ...f, url: e.target.value }))}
                    required
                  />
                </div>
                <div style={{
                  background: 'rgba(246,173,85,0.1)', border: '1px solid rgba(246,173,85,0.2)',
                  borderRadius: 8, padding: '12px 16px', fontSize: 12, color: 'var(--warning)'
                }}>
                  ⚠️ The M3U URL will be saved as-is. Make sure it points to a valid M3U/M3U8 playlist.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowM3UModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '...' : '📥 Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
