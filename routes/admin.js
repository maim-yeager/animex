// routes/admin.js
// Admin API routes - secure with simple token auth

const express = require('express');
const router = express.Router();
const { adminStore, flushCache } = require('../utils/cache');

const ADMIN_USER = process.env.ADMIN_USERNAME || 'xtmaim';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'xtmaim2024secure';
const ADMIN_TOKEN = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64');

// Middleware: check admin token
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token === ADMIN_TOKEN) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true, token: ADMIN_TOKEN, name: 'XT Maim' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Get dashboard stats
router.get('/stats', adminAuth, (req, res) => {
  res.json({
    stats: adminStore.stats,
    announcements: adminStore.announcements,
    featuredBanners: adminStore.featuredBanners,
    homeSections: adminStore.homeSections,
    manualAnime: adminStore.manualAnime
  });
});

// Add announcement
router.post('/announcement', adminAuth, (req, res) => {
  const { text, type } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const item = { id: Date.now(), text, type: type || 'info', createdAt: new Date() };
  adminStore.announcements.unshift(item);
  res.json({ success: true, item });
});

// Remove announcement
router.delete('/announcement/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  adminStore.announcements = adminStore.announcements.filter(a => a.id !== id);
  res.json({ success: true });
});

// Add/manage featured banners
router.post('/banner', adminAuth, (req, res) => {
  const { title, img, link, desc } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const item = { id: Date.now(), title, img, link, desc };
  adminStore.featuredBanners.push(item);
  res.json({ success: true, item });
});

router.delete('/banner/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  adminStore.featuredBanners = adminStore.featuredBanners.filter(b => b.id !== id);
  res.json({ success: true });
});

// Add anime manually
router.post('/add-anime', adminAuth, (req, res) => {
  const { title, thumbnail, link, description, genres } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const item = {
    id: `manual_${Date.now()}`,
    title, thumbnail, link, description,
    genres: genres || [],
    createdAt: new Date(),
    isManual: true
  };
  adminStore.manualAnime.push(item);
  res.json({ success: true, item });
});

router.delete('/anime/:id', adminAuth, (req, res) => {
  adminStore.manualAnime = adminStore.manualAnime.filter(a => a.id !== req.params.id);
  res.json({ success: true });
});

// Update home sections
router.post('/sections', adminAuth, (req, res) => {
  Object.assign(adminStore.homeSections, req.body);
  res.json({ success: true, sections: adminStore.homeSections });
});

// Clear cache
router.post('/clear-cache', adminAuth, (req, res) => {
  flushCache();
  res.json({ success: true, message: 'Cache cleared' });
});

module.exports = router;
