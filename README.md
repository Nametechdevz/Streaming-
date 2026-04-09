# 📺 IPTV Streaming Platform

A complete IPTV streaming solution with Xtream Codes support, including:
- **Backend API** (Node.js/Express) — Xtream Codes compatible
- **Admin Panel** (React) — DNS config, user management, dashboard
- **Mobile App** (React Native) — Netflix-style UI with Live TV, Movies, Series

---

## 🏗️ Architecture

```
Streaming-/
├── backend/          # Node.js/Express REST API + Xtream Codes endpoint
├── admin-panel/      # React admin panel
└── mobile-app/       # React Native mobile app
```

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env     # Edit your settings
npm install
npm run dev
```

API runs on `http://localhost:5000`

| Endpoint | Description |
|---|---|
| `POST /api/auth/login` | Login |
| `GET /api/users` | List users (admin) |
| `GET /api/dns` | DNS configs (admin) |
| `GET /api/streams/live` | Live channels |
| `GET /api/streams/movies` | Movies |
| `GET /api/streams/series` | Series |
| `/player_api.php` | Xtream Codes API |
| `/get.php?...&type=m3u_plus` | M3U Playlist |

**Default credentials:** `admin` / `admin123`

### 2. Admin Panel

```bash
cd admin-panel
npm install
npm start
```

Opens at `http://localhost:3000`

### 3. Mobile App (React Native)

```bash
cd mobile-app
npm install
npx react-native run-android  # or run-ios
```

---

## ⚙️ Features

### Backend
- JWT authentication
- Xtream Codes compatible API (`/player_api.php`)
- M3U playlist generation (`/get.php`)
- User management with expiry dates & connection limits
- DNS/Server management (Xtream + M3U types)
- In-memory DB (swap for MongoDB in production)

### Admin Panel
- 📊 Dashboard with stats & charts
- 👥 User CRUD (create, edit, delete, enable/disable)
- 🌐 DNS/Server management (test connection, activate)
- 📋 Import M3U playlist
- 📺 Content library browser (Live, Movies, Series)
- 🗂️ Category management

### Mobile App
- 🔐 Login screen
- 📡 Live TV — channel list with category filter & search
- 🎬 Movies — Netflix-style grid with hero banner
- 🎭 Series — grid view + season/episode browser
- ▶️ Video player screen (connect `react-native-video`)
- 👤 Profile — Xtream Codes credentials, settings

---

## 📱 Xtream Codes Integration

Connect any IPTV player using:

| Field | Value |
|---|---|
| Server | `http://YOUR_IP:5000` |
| Username | (any user you create) |
| Password | (user's password) |

**Compatible with:** Tivimate, IPTV Smarters, Perfect Player, VLC, Kodi, and all Xtream Codes players.

---

## 🔧 Production Setup

1. Replace in-memory DB with MongoDB (update `inMemoryDB.js` → Mongoose models)
2. Set strong `JWT_SECRET` in `.env`
3. Configure HTTPS with a reverse proxy (nginx/traefik)
4. Set `CORS_ORIGIN` to your admin panel domain
5. For mobile: update `BASE_URL` in `mobile-app/src/services/api.js`

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, JWT, bcrypt |
| Admin UI | React 18, React Router, Recharts |
| Mobile | React Native 0.72, React Navigation |
| Protocol | Xtream Codes API, M3U/M3U8 |
