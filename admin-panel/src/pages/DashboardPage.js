import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#e50914', '#63b3ed', '#48bb78', '#f6ad55', '#9f7aea'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.stats().then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-screen" style={{ minHeight: '60vh' }}>
      <div className="loader" />
    </div>
  );

  const s = data?.stats || {};

  const barData = [
    { name: 'Live TV', count: s.totalStreams || 0 },
    { name: 'Movies', count: s.totalMovies || 0 },
    { name: 'Series', count: s.totalSeries || 0 },
    { name: 'Categories', count: s.totalCategories || 0 }
  ];

  const userPieData = [
    { name: 'Active', value: s.activeUsers || 0 },
    { name: 'Expired', value: s.expiredUsers || 0 },
    { name: 'Disabled', value: s.disabledUsers || 0 }
  ].filter(d => d.value > 0);

  const statCards = [
    { icon: '👥', label: 'Total Users', value: s.totalUsers || 0, color: 'blue' },
    { icon: '✅', label: 'Active Users', value: s.activeUsers || 0, color: 'green' },
    { icon: '⏰', label: 'Expired', value: s.expiredUsers || 0, color: 'orange' },
    { icon: '📺', label: 'Live Channels', value: s.totalStreams || 0, color: 'red' },
    { icon: '🎬', label: 'Movies', value: s.totalMovies || 0, color: 'purple' },
    { icon: '🎭', label: 'Series', value: s.totalSeries || 0, color: 'blue' },
    { icon: '🌐', label: 'DNS Configs', value: s.totalDnsConfigs || 0, color: 'green' },
    { icon: '🗂️', label: 'Categories', value: s.totalCategories || 0, color: 'orange' }
  ];

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${card.color}`}>{card.icon}</div>
            <div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Content Library</div>
              <div className="card-subtitle">Total content by type</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#718096" fontSize={12} />
              <YAxis stroke="#718096" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#16213e', border: '1px solid #2d3748', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#e50914" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">User Distribution</div>
              <div className="card-subtitle">Status breakdown</div>
            </div>
          </div>
          {userPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={userPieData}
                  cx="50%" cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#718096' }}
                >
                  {userPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#16213e', border: '1px solid #2d3748', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>No users yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      {data?.recentUsers?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Users</div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Max Connections</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map(user => (
                  <tr key={user.id}>
                    <td><strong>{user.username}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{user.email || '—'}</td>
                    <td>{user.maxConnections}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {user.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
