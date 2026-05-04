// utils/helpers.js
// Shared helper functions

// Clean image URL
function cleanImg(url) {
  if (!url) return '';
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/')) return (process.env.BASE_URL || 'https://watchanimeworld.net') + url;
  return url;
}

// Slugify text
function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .trim();
}

// Extract ID from URL
function extractId(url) {
  if (!url) return '';
  return url.split('/').filter(Boolean).pop() || '';
}

// Truncate text
function truncate(text, len = 150) {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '...' : text;
}

// Sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { cleanImg, slugify, extractId, truncate, sleep };
