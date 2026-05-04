// routes/api.js
// All anime API routes

const express = require('express');
const router = express.Router();
const scraper = require('../scraper/animeScraper');
const { getCache, setCache, adminStore } = require('../utils/cache');

// ─── Anime Routes ──────────────────────────────────────────────────

// Home page data
router.get('/home', async (req, res) => {
  try {
    const cacheKey = 'home_data';
    let data = getCache(cacheKey);

    if (!data) {
      data = await scraper.getHomeData();
      if (data) setCache(cacheKey, data, 300);
    }

    adminStore.stats.totalVisits++;

    if (!data) {
      return res.json({
        featured: [], trending: [], recent: [], popular: [],
        announcements: adminStore.announcements,
        homeSections: adminStore.homeSections
      });
    }

    res.json({
      ...data,
      announcements: adminStore.announcements,
      homeSections: adminStore.homeSections,
      manualFeatured: adminStore.featuredBanners
    });
  } catch (err) {
    console.error('[API /home]', err.message);
    res.status(500).json({ error: 'Failed to fetch home data' });
  }
});

// Search
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const cacheKey = `search_${q.toLowerCase().trim()}`;
    let results = getCache(cacheKey);

    if (!results) {
      results = await scraper.searchAnime(q.trim());
      if (results) setCache(cacheKey, results, 180);
    }

    adminStore.stats.searchCount++;
    res.json({ results: results || [], query: q });
  } catch (err) {
    console.error('[API /search]', err.message);
    res.status(500).json({ error: 'Search failed', results: [] });
  }
});

// Anime details
router.get('/anime/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `anime_${id}`;
    let data = getCache(cacheKey);

    if (!data) {
      data = await scraper.getAnimeDetails(id);
      if (data) setCache(cacheKey, data, 600);
    }

    if (!data) return res.status(404).json({ error: 'Anime not found' });
    res.json(data);
  } catch (err) {
    console.error('[API /anime/:id]', err.message);
    res.status(500).json({ error: 'Failed to fetch anime details' });
  }
});

// Episode data
router.get('/episode/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `ep_${id}`;
    let data = getCache(cacheKey);

    if (!data) {
      data = await scraper.getEpisodeData(id);
      if (data) setCache(cacheKey, data, 120);
    }

    adminStore.stats.watchCount++;
    if (!data) return res.status(404).json({ error: 'Episode not found' });
    res.json(data);
  } catch (err) {
    console.error('[API /episode/:id]', err.message);
    res.status(500).json({ error: 'Failed to fetch episode' });
  }
});

// Hindi dub anime
router.get('/hindi-dub', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const cacheKey = `hindi_dub_p${page}`;
    let data = getCache(cacheKey);

    if (!data) {
      data = await scraper.getHindiDubAnime(page);
      if (data) setCache(cacheKey, data, 300);
    }

    res.json({ results: data || [], page });
  } catch (err) {
    console.error('[API /hindi-dub]', err.message);
    res.status(500).json({ error: 'Failed to fetch Hindi dub anime', results: [] });
  }
});

// Trending anime
router.get('/trending', async (req, res) => {
  try {
    const cacheKey = 'trending';
    let data = getCache(cacheKey);

    if (!data) {
      data = await scraper.getTrendingAnime();
      if (data) setCache(cacheKey, data, 600);
    }

    res.json({ results: data || [] });
  } catch (err) {
    console.error('[API /trending]', err.message);
    res.status(500).json({ error: 'Failed to fetch trending anime', results: [] });
  }
});

// Recently added
router.get('/recent', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const cacheKey = `recent_p${page}`;
    let data = getCache(cacheKey);

    if (!data) {
      data = await scraper.getRecentAnime(page);
      if (data) setCache(cacheKey, data, 180);
    }

    res.json({ results: data || [], page });
  } catch (err) {
    console.error('[API /recent]', err.message);
    res.status(500).json({ error: 'Failed to fetch recent anime', results: [] });
  }
});

// Genre
router.get('/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const page = parseInt(req.query.page) || 1;
    const cacheKey = `genre_${genre}_p${page}`;
    let data = getCache(cacheKey);

    if (!data) {
      data = await scraper.getAnimeByGenre(genre, page);
      if (data) setCache(cacheKey, data, 300);
    }

    res.json({ results: data || [], genre, page });
  } catch (err) {
    console.error('[API /genre/:genre]', err.message);
    res.status(500).json({ error: 'Failed to fetch genre anime', results: [] });
  }
});

module.exports = router;
