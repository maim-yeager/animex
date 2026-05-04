// utils/cache.js
// Simple in-memory cache using node-cache

const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes default
  checkperiod: 60,
  useClones: false
});

// Admin data store (in-memory for Render free plan)
const adminStore = {
  featuredBanners: [],
  announcements: [],
  manualAnime: [],
  homeSections: {
    showTrending: true,
    showRecent: true,
    showHindi: true,
    showPopular: true
  },
  stats: {
    totalVisits: 0,
    searchCount: 0,
    watchCount: 0
  }
};

function getCache(key) {
  return cache.get(key);
}

function setCache(key, value, ttl) {
  if (ttl) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
}

function delCache(key) {
  cache.del(key);
}

function flushCache() {
  cache.flushAll();
}

function getCacheStats() {
  return cache.getStats();
}

module.exports = {
  getCache,
  setCache,
  delCache,
  flushCache,
  getCacheStats,
  adminStore
};
