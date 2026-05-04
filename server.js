// server.js
// Maim Animex - Main Server Entry Point
// Developer: XT Maim | Contact: xtmaim28@gmail.com | WhatsApp: 01833515655

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security & Performance Middleware ────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Allow iframe embeds for video player
  crossOriginEmbedderPolicy: false
}));
app.use(compression()); // Gzip all responses
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging in production
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ─────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many search requests' }
});

app.use('/api', limiter);
app.use('/api/search', searchLimiter);

// ─── Static Files ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ─── Routes ────────────────────────────────────────────────────────
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Health check (for Render)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), service: 'Maim Animex' });
});

// Serve frontend for any non-API route (SPA support)
app.get('*', (req, res) => {
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Error Handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║       🎌 Maim Animex Server 🎌         ║
║  Port: ${PORT}                            ║
║  Dev: XT Maim                          ║
║  Email: xtmaim28@gmail.com             ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
