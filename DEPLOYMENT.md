# 🎌 Maim Animex – Deployment Guide

**Developer:** XT Maim  
**Email:** xtmaim28@gmail.com  
**WhatsApp:** 01833515655

---

## 📁 Project Structure

```
animex/
├── server.js              ← Main server entry point
├── package.json           ← Dependencies & start script
├── render.yaml            ← Render auto-deploy config
├── .env                   ← Environment variables (local only)
├── .gitignore
│
├── routes/
│   ├── api.js             ← All anime API routes
│   └── admin.js           ← Admin dashboard API
│
├── scraper/
│   └── animeScraper.js    ← WatchAnimeWorld scraper
│
├── utils/
│   ├── cache.js           ← In-memory cache + admin store
│   └── helpers.js         ← Shared utilities
│
├── public/
│   └── index.html         ← Main frontend (single file)
│
└── admin/
    └── dashboard.html     ← Admin dashboard UI
```

---

## 🚀 Deploy on Render (Free Plan)

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and create a **new repository**
2. Name it: `maim-animex`
3. Upload all project files (or use Git)

```bash
git init
git add .
git commit -m "Initial commit - Maim Animex"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/maim-animex.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select the `maim-animex` repository
5. Fill in:

| Field | Value |
|-------|-------|
| **Name** | maim-animex |
| **Environment** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | Free |

6. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `ADMIN_USERNAME` | `xtmaim` |
| `ADMIN_PASSWORD` | `xtmaim2024secure` |
| `JWT_SECRET` | `animex_maim_secret_2024` |
| `CACHE_TTL` | `300` |
| `BASE_URL` | `https://watchanimeworld.net` |

7. Click **"Create Web Service"**
8. Wait 2–3 minutes for deployment ✅

### Step 3: Access Your Site

- **Main Site:** `https://maim-animex.onrender.com`
- **Admin Panel:** `https://maim-animex.onrender.com/admin`
- **Admin Login:** Username: `xtmaim` | Password: `xtmaim2024secure`

---

## 💻 Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start server
node server.js

# 3. Open browser
# Main site: http://localhost:3000
# Admin: http://localhost:3000/admin
```

---

## 🔧 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/home` | Home page data |
| GET | `/api/search?q=naruto` | Search anime |
| GET | `/api/anime/:id` | Anime details |
| GET | `/api/episode/:id` | Episode/watch data |
| GET | `/api/hindi-dub` | Hindi dubbed anime |
| GET | `/api/trending` | Trending anime |
| GET | `/api/recent` | Recently added |
| GET | `/api/genre/:genre` | Anime by genre |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/stats` | Dashboard stats |
| POST | `/api/admin/announcement` | Add announcement |
| POST | `/api/admin/banner` | Add hero banner |
| POST | `/api/admin/add-anime` | Add anime manually |
| POST | `/api/admin/clear-cache` | Clear cache |

---

## 🎛️ Features

### Frontend (public/index.html)
- ✅ Premium dark anime UI
- ✅ Hero banner slider with 5 slides
- ✅ Search with live dropdown suggestions
- ✅ Trending, Recent, Hindi Dub sections
- ✅ Anime details page with episode list
- ✅ Built-in HLS.js video player
- ✅ Favorites (saved to localStorage)
- ✅ Continue watching with progress
- ✅ Genre filter chips
- ✅ Mobile responsive + bottom nav
- ✅ Glassmorphism & neon glow effects
- ✅ Skeleton loading animations

### Backend (server.js + routes/)
- ✅ Express.js REST API
- ✅ Cheerio scraper for WatchAnimeWorld
- ✅ In-memory cache (5 min TTL)
- ✅ Rate limiting (200 req/15min)
- ✅ CORS + Compression middleware
- ✅ Helmet security headers
- ✅ Error handling

### Admin Dashboard (admin/dashboard.html)
- ✅ Secure login (token-based)
- ✅ Live stats (visits, searches, watches)
- ✅ Add/remove announcements
- ✅ Add/remove hero banners
- ✅ Add anime manually
- ✅ Toggle home page sections
- ✅ Clear cache button

---

## ⚠️ Notes

- Render free plan **sleeps after 15 min** of inactivity. First load may take ~30s.
- To keep it awake, use a free uptime monitor like [UptimeRobot](https://uptimerobot.com)
- Change `ADMIN_PASSWORD` in environment variables for security
- Scraping depends on WatchAnimeWorld's HTML structure. If it changes, update `scraper/animeScraper.js`

---

## 📞 Support

**XT Maim**  
📧 xtmaim28@gmail.com  
📱 WhatsApp: 01833515655
