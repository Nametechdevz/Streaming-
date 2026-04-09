import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { categoriesAPI } from '../utils/api';

const defaultForm = { name: '', type: 'live', icon: '📺' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('live');

  const fetchCategories = () => {
    categoriesAPI.list().then(cats => {
      setCategories(cats);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const filtered = categories.filter(c => c.type === tab);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm, type: tab });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, type: cat.type, icon: cat.icon });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await categoriesAPI.update(editing.id, form);
        toast.success('Category updated');
      } else {
        await categoriesAPI.create(form);
        toast.success('Category created');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await categoriesAPI.delete(cat.id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err?.error || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Categories</div>
          <div className="page-desc">{categories.length} total categories</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>➕ New Category</button>
      </div>

      <div className="tabs">
        {[
          { key: 'live', label: '📡 Live TV' },
          { key: 'movie', label: '🎬 Movies' },
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

      {loading ? (
        <div className="loading-screen" style={{ minHeight: '30vh' }}>
          <div className="loader" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🗂️</div>
            <h3>No categories for {tab}</h3>
            <p>Add your first category to organize content</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {filtered.map(cat => (
            <div key={cat.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(229,9,20,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0
              }}>
                {cat.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{cat.name}</div>
                <span className={`badge ${cat.type === 'live' ? 'badge-info' : cat.type === 'movie' ? 'badge-warning' : 'badge-success'}`}>
                  {cat.type}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(cat)}>✏️</button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(cat)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Category' : 'New Category'}</div>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Icon</label>
                    <input
                      className="form-control"
                      placeholder="📺"
                      value={form.icon}
                      onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                      style={{ fontSize: 20 }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-control"
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    >
                      <option value="live">Live TV</option>
                      <option value="movie">Movies</option>
                      <option value="series">Series</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    className="form-control"
                    placeholder="Category name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '...' : (editing ? 'Save' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
