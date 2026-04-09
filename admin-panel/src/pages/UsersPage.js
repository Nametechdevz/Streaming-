import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { usersAPI } from '../utils/api';

const defaultForm = {
  username: '', password: '', email: '', role: 'user',
  maxConnections: 1, expiresAt: '', isActive: true
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    usersAPI.list().then(data => {
      setUsers(data.users);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      username: user.username,
      password: '',
      email: user.email || '',
      role: user.role,
      maxConnections: user.maxConnections,
      expiresAt: user.expiresAt ? user.expiresAt.split('T')[0] : '',
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (!payload.expiresAt) payload.expiresAt = null;
      else payload.expiresAt = new Date(payload.expiresAt).toISOString();

      if (editing) {
        await usersAPI.update(editing.id, payload);
        toast.success('User updated successfully');
      } else {
        if (!payload.password) {
          toast.error('Password is required for new users');
          return;
        }
        await usersAPI.create(payload);
        toast.success('User created successfully');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err?.error || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.username}"?`)) return;
    try {
      await usersAPI.delete(user.id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err?.error || 'Failed to delete user');
    }
  };

  const handleToggle = async (user) => {
    try {
      await usersAPI.toggle(user.id);
      toast.success(`User ${user.isActive ? 'disabled' : 'enabled'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to toggle user status');
    }
  };

  const isExpired = (expiresAt) => expiresAt && new Date(expiresAt) < new Date();

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Users</div>
          <div className="page-desc">{users.filter(u => u.role !== 'admin').length} total users</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          ➕ New User
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          {loading ? (
            <div className="empty-state"><div className="loader" style={{ margin: '0 auto' }} /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>No users found</h3>
              <p>Create your first user to get started</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Connections</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32,
                          background: 'linear-gradient(135deg, #e50914, #9f7aea)',
                          borderRadius: '50%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 13, color: 'white'
                        }}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.username}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-info' : 'badge-muted'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.maxConnections}</td>
                    <td style={{ color: isExpired(user.expiresAt) ? 'var(--danger)' : 'var(--text-muted)', fontSize: 12 }}>
                      {user.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : 'Never'}
                      {isExpired(user.expiresAt) && <span style={{ marginLeft: 4 }}>⚠️</span>}
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? '● Active' : '● Disabled'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(user)}>✏️</button>
                        <button
                          className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggle(user)}
                        >
                          {user.isActive ? '🚫' : '✅'}
                        </button>
                        {user.role !== 'admin' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user)}>🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit User' : 'Create New User'}</div>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input
                      className="form-control"
                      value={form.username}
                      onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{editing ? 'New Password' : 'Password *'}</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder={editing ? 'Leave blank to keep current' : ''}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required={!editing}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="form-control"
                      value={form.role}
                      onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Connections</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max="10"
                      value={form.maxConnections}
                      onChange={e => setForm(f => ({ ...f, maxConnections: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.expiresAt}
                    onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  />
                </div>
                {editing && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={form.isActive ? 'true' : 'false'}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}
                    >
                      <option value="true">Active</option>
                      <option value="false">Disabled</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '...' : (editing ? 'Save Changes' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
