const express = require('express');
const axios = require('axios');
const router = express.Router();

const CACHE_DURATION = 2 * 60 * 1000; 
const priceCache = new Map();

router.get('/', async (req, res) => {
  try {
    const ids = req.query.ids;
    const perPage = req.query.per_page || 100;

    if (!ids) {
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: perPage,
          page: 1,
          sparkline: false,
          price_change_percentage: '1h,24h,7d'
        }
      });
      return res.json(response.data);
    }

    const coinIds = ids.split(',').map(id => id.trim().toLowerCase()).filter(id => id);
    if (coinIds.length === 0) {
      return res.status(400).json({ error: 'No valid coin IDs provided' });
    }
    const cacheKey = coinIds.sort().join(',');
    const now = Date.now();

    if (priceCache.has(cacheKey)) {
      const { data, timestamp } = priceCache.get(cacheKey);
      if (now - timestamp < CACHE_DURATION) {
        return res.json(data);
      }
    }
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: coinIds.join(','),
        per_page: coinIds.length,
        page: 1,
        sparkline: false,
        price_change_percentage: '1h,24h,7d'
      }
    });
    if (!response.data || !Array.isArray(response.data)) {
      return res.json([]);
    }
    priceCache.set(cacheKey, { data: response.data, timestamp: now });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching prices:', error);
    if (error.response) {
      if (error.response.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      if (error.response.status === 404) {
        return res.status(404).json({ error: 'One or more coins not found' });
      }
    }
    res.status(500).json({ 
      error: 'Error fetching prices', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 