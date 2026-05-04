// scraper/animeScraper.js
// Core scraping engine for WatchAnimeWorld

const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = process.env.BASE_URL || 'https://watchanimeworld.net';

// Axios instance with headers to avoid bot detection
const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Cache-Control': 'max-age=0',
  }
});

// Helper: fetch page HTML
async function fetchPage(url) {
  try {
    const response = await http.get(url);
    return cheerio.load(response.data);
  } catch (error) {
    console.error(`[Scraper] Error fetching ${url}:`, error.message);
    return null;
  }
}

// Extract anime card data from common selectors
function extractAnimeCard($, el) {
  const $el = $(el);
  const title = $el.find('.film-name, .dynamic-name, h3, .name, .title').first().text().trim()
    || $el.find('a').attr('title') || 'Unknown';
  const link = $el.find('a').first().attr('href') || '';
  const img = $el.find('img').attr('data-src')
    || $el.find('img').attr('src') || '';
  const episodes = $el.find('.tick-eps, .episode, .ep-count').first().text().trim() || '';
  const rating = $el.find('.tick-rate, .rating').first().text().trim() || '';
  const type = $el.find('.tick-dub, .type').first().text().trim() || '';
  const status = $el.find('.status').first().text().trim() || '';

  const id = link.split('/').filter(Boolean).pop() || '';

  return {
    id,
    title,
    link: link.startsWith('http') ? link : `${BASE_URL}${link}`,
    thumbnail: img.startsWith('http') ? img : (img ? `${BASE_URL}${img}` : 'https://placehold.co/300x420/1a0a2e/9d4edd?text=No+Image'),
    episodes: episodes || '?',
    rating: rating || 'N/A',
    type: type || '',
    status: status || '',
    isHindi: title.toLowerCase().includes('hindi') || type.toLowerCase().includes('hindi') || $el.find('.dub').length > 0
  };
}

// ─── Scraper Functions ─────────────────────────────────────────────

// Get home page data
async function getHomeData() {
  const $ = await fetchPage('/');
  if (!$) return null;

  // Hero/featured anime
  const featured = [];
  $('.swiper-slide, .slider-item, #main-banner .item').each((i, el) => {
    if (i >= 5) return;
    const $el = $(el);
    const title = $el.find('h2, h1, .title, .name').first().text().trim();
    const img = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
    const link = $el.find('a').first().attr('href') || '';
    const desc = $el.find('p, .description, .desc').first().text().trim() || '';
    if (title) featured.push({
      title, img: img.startsWith('http') ? img : `${BASE_URL}${img}`,
      link: link.startsWith('http') ? link : `${BASE_URL}${link}`, desc
    });
  });

  // Trending
  const trending = [];
  $('.trending-list .item, #trending .film_list-wrap .flw-item, .trending .item').each((i, el) => {
    if (i >= 12) return;
    const card = extractAnimeCard($, el);
    if (card.title !== 'Unknown') trending.push(card);
  });

  // Recent
  const recent = [];
  $('.film_list-wrap .flw-item, .recent .item, #recent-release .item').each((i, el) => {
    if (i >= 18) return;
    const card = extractAnimeCard($, el);
    if (card.title !== 'Unknown') recent.push(card);
  });

  // Popular
  const popular = [];
  $('.sidebar .item, .popular-list .item, #popular .flw-item').each((i, el) => {
    if (i >= 10) return;
    const card = extractAnimeCard($, el);
    if (card.title !== 'Unknown') popular.push(card);
  });

  // If structured sections not found, fallback to all cards
  if (trending.length === 0 && recent.length === 0) {
    $('.flw-item, .film-item, .anime-item').each((i, el) => {
      if (i >= 24) return;
      const card = extractAnimeCard($, el);
      if (card.title !== 'Unknown') {
        if (i < 6) featured.length < 3 && featured.push({ title: card.title, img: card.thumbnail, link: card.link, desc: '' });
        if (i < 12) trending.push(card);
        else recent.push(card);
      }
    });
  }

  return { featured, trending, recent, popular };
}

// Search anime
async function searchAnime(query) {
  const $ = await fetchPage(`/?s=${encodeURIComponent(query)}`);
  if (!$) return [];

  const results = [];
  $('.flw-item, .film-item, .anime-item, .search-item, article').each((i, el) => {
    if (i >= 20) return;
    const card = extractAnimeCard($, el);
    if (card.title !== 'Unknown' && card.title.length > 1) results.push(card);
  });

  // Try alternate search URL
  if (results.length === 0) {
    const $2 = await fetchPage(`/search/${encodeURIComponent(query)}`);
    if ($2) {
      $2('.flw-item, .film-item, article').each((i, el) => {
        if (i >= 20) return;
        const card = extractAnimeCard($2, el);
        if (card.title !== 'Unknown') results.push(card);
      });
    }
  }

  return results;
}

// Get anime details
async function getAnimeDetails(animeId) {
  const $ = await fetchPage(`/${animeId}`);
  if (!$) return null;

  const title = $('h1, h2.title, .film-name').first().text().trim()
    || $('.detail-title').text().trim() || animeId;
  const poster = $('.film-poster img, .anime-poster img, .poster img').attr('src')
    || $('.film-poster img').attr('data-src') || '';
  const banner = $('.film-poster, .detail-banner').css('background-image') || '';
  const description = $('.film-description, .detail-description, .description, .synopsis').first().text().trim() || '';
  const rating = $('.tick-rate, .rating-value, .score').first().text().trim() || 'N/A';
  const status = $('.tick-status, .status, .anime-status').first().text().trim() || 'Unknown';
  const type = $('.tick-type, .type').first().text().trim() || 'Unknown';

  const genres = [];
  $('.genres a, .genre-list a, .film-genre a, a[href*="genre"]').each((i, el) => {
    const g = $(el).text().trim();
    if (g && !genres.includes(g)) genres.push(g);
  });

  const episodes = [];
  $('.ss-list a, .episode-list a, .ep-list a, #episode-list a').each((i, el) => {
    const $ep = $(el);
    const epNum = $ep.text().trim() || `EP ${i + 1}`;
    const epLink = $ep.attr('href') || '';
    episodes.push({
      number: epNum,
      id: epLink.split('/').filter(Boolean).pop() || '',
      link: epLink.startsWith('http') ? epLink : `${BASE_URL}${epLink}`
    });
  });

  const related = [];
  $('.related-item, .more-item, .sidebar .flw-item').each((i, el) => {
    if (i >= 8) return;
    const card = extractAnimeCard($, el);
    if (card.title !== 'Unknown') related.push(card);
  });

  return {
    id: animeId,
    title,
    poster: poster.startsWith('http') ? poster : (poster ? `${BASE_URL}${poster}` : ''),
    banner: banner.replace(/url\(['"]?/, '').replace(/['"]?\)/, ''),
    description,
    rating,
    status,
    type,
    genres,
    totalEpisodes: episodes.length,
    episodes,
    related,
    isHindi: title.toLowerCase().includes('hindi') || type.toLowerCase().includes('hindi dub')
  };
}

// Get episode watch data (streaming links)
async function getEpisodeData(episodeId) {
  const $ = await fetchPage(`/${episodeId}`);
  if (!$) return null;

  // Extract iframe src (video player)
  const iframeSrc = $('iframe[src*="player"], iframe[src*="embed"], iframe[src*="watch"], .player iframe, #player iframe').attr('src') || '';
  const watchLinks = [];

  // Gather all possible video links
  $('a[href*=".m3u8"], a[href*="embed"], a[href*="player"], source[src]').each((i, el) => {
    const href = $(el).attr('href') || $(el).attr('src') || '';
    if (href) watchLinks.push(href.startsWith('http') ? href : `${BASE_URL}${href}`);
  });

  const title = $('h1, h2, .ep-title').first().text().trim() || episodeId;

  return {
    id: episodeId,
    title,
    iframeSrc: iframeSrc.startsWith('http') ? iframeSrc : (iframeSrc ? `${BASE_URL}${iframeSrc}` : ''),
    watchLinks,
    rawHtml: $('body').html()?.substring(0, 500) || ''
  };
}

// Get Hindi dubbed anime
async function getHindiDubAnime(page = 1) {
  const urls = [
    `/category/hindi-dubbed/?page=${page}`,
    `/genre/hindi-dub/?page=${page}`,
    `/?language=hindi&page=${page}`,
    `/hindi-dubbed/?page=${page}`
  ];

  for (const url of urls) {
    const $ = await fetchPage(url);
    if (!$) continue;

    const items = [];
    $('.flw-item, .film-item, .anime-item').each((i, el) => {
      const card = extractAnimeCard($, el);
      if (card.title !== 'Unknown') items.push({ ...card, isHindi: true });
    });

    if (items.length > 0) return items;
  }

  // Fallback: search for hindi dubbed
  return await searchAnime('hindi dubbed');
}

// Get trending anime
async function getTrendingAnime() {
  const $ = await fetchPage('/most-popular');
  if (!$) return [];

  const items = [];
  $('.flw-item, .film-item, .anime-item').each((i, el) => {
    if (i >= 24) return;
    const card = extractAnimeCard($, el);
    if (card.title !== 'Unknown') items.push(card);
  });

  if (items.length === 0) {
    const $2 = await fetchPage('/top-airing');
    if ($2) {
      $2('.flw-item, .film-item').each((i, el) => {
        if (i >= 24) return;
        const card = extractAnimeCard($2, el);
        if (card.title !== 'Unknown') items.push(card);
      });
    }
  }

  return items;
}

// Get recently added
async function getRecentAnime(page = 1) {
  const $ = await fetchPage(`/recently-added?page=${page}`);
  if (!$) return [];

  const items = [];
  $('.flw-item, .film-item, .anime-item').each((i, el) => {
    if (i >= 24) return;
    const card = extractAnimeCard($, el);
    if (card.title !== 'Unknown') items.push(card);
  });

  return items;
}

// Get anime by genre
async function getAnimeByGenre(genre, page = 1) {
  const $ = await fetchPage(`/genre/${genre}?page=${page}`);
  if (!$) return [];

  const items = [];
  $('.flw-item, .film-item, .anime-item').each((i, el) => {
    if (i >= 24) return;
    const card = extractAnimeCard($, el);
    if (card.title !== 'Unknown') items.push(card);
  });

  return items;
}

module.exports = {
  getHomeData,
  searchAnime,
  getAnimeDetails,
  getEpisodeData,
  getHindiDubAnime,
  getTrendingAnime,
  getRecentAnime,
  getAnimeByGenre
};
