const express = require('express');
const axios = require('axios');
const router = express.Router();

// Duración del caché en milisegundos (2 minutos)
const CACHE_DURATION = 2 * 60 * 1000;
const cache = new Map();

// Obtener precios de CoinGecko con caché
router.get('/', async (req, res) => {
  try {
    const { ids } = req.query;
    const cacheKey = ids || 'all';
    const now = Date.now();

    // Revisar si hay datos en caché y no expiraron
    if (cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);
      if (now - timestamp < CACHE_DURATION) {
        return res.json(data);
      }
    }

    // Llamada a CoinGecko
    const params = {
      vs_currency: 'usd',
      ids,
      per_page: ids ? ids.split(',').length : 100,
      page: 1,
      sparkline: false,
      price_change_percentage: '1h,24h,7d'
    };
    const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/markets', { params });

    // Guardar en caché
    cache.set(cacheKey, { data, timestamp: now });
    res.json(data);
  } catch (error) {
    console.error('Error fetching prices:', error);
    // Si hay datos en caché, devolverlos aunque estén expirados
    const { ids } = req.query;
    const cacheKey = ids || 'all';
    if (cache.has(cacheKey)) {
      const { data } = cache.get(cacheKey);
      return res.json(data);
    }
    res.status(500).json({ error: 'Error fetching prices' });
  }
});

module.exports = router; 