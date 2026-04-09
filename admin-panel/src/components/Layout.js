import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard', exact: true },
  { to: '/users', icon: '👥', label: 'Users' },
  { to: '/dns', icon: '🌐', label: 'DNS / Servers' },
  { to: '/streams', icon: '📺', label: 'Streams' },
  { to: '/categories', icon: '🗂️', label: 'Categories' }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard', subtitle: 'Platform overview & statistics' };
    if (path === '/users') return { title: 'User Management', subtitle: 'Manage platform users & subscriptions' };
    if (path === '/dns') return { title: 'DNS & Servers', subtitle: 'Configure IPTV servers and DNS settings' };
    if (path === '/streams') return { title: 'Content Library', subtitle: 'Live TV, Movies & Series' };
    if (path === '/categories') return { title: 'Categories', subtitle: 'Organize your content' };
    return { title: 'IPTV Admin', subtitle: '' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">📺</div>
          <h1>IPTV Platform</h1>
          <p>Admin Panel v1.0</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Menu</div>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="user-name">{user?.username}</div>
              <div className="user-role">Administrator</div>
            </div>
            <button className="btn-logout" onClick={logout} title="Logout">
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">{title}</div>
            {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
          </div>
          <div className="topbar-right">
            <div className="status-dot" />
            <span className="status-label">System Online</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
