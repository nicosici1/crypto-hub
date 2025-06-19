const express = require('express');
const axios = require('axios');
const router = express.Router();

// --- CACHÉ EN MEMORIA ---
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos
const priceCache = new Map(); // key: ids string, value: { data, timestamp }

router.get('/', async (req, res) => {
  try {
    const ids = req.query.ids;
    const perPage = req.query.per_page || 100;

    // Si no hay IDs, devolver el top 100
    if (!ids) {
      // (opcional: también puedes cachear el top 100 si quieres)
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

    // Validar y limpiar los IDs
    const coinIds = ids.split(',').map(id => id.trim().toLowerCase()).filter(id => id);
    if (coinIds.length === 0) {
      return res.status(400).json({ error: 'No valid coin IDs provided' });
    }
    const cacheKey = coinIds.sort().join(',');
    const now = Date.now();
    // Revisar caché
    if (priceCache.has(cacheKey)) {
      const { data, timestamp } = priceCache.get(cacheKey);
      if (now - timestamp < CACHE_DURATION) {
        return res.json(data);
      }
    }
    // Hacer la petición a CoinGecko
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
    // Si no hay datos, devolver array vacío
    if (!response.data || !Array.isArray(response.data)) {
      return res.json([]);
    }
    // Guardar en caché
    priceCache.set(cacheKey, { data: response.data, timestamp: now });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching prices:', error);
    // Manejar errores específicos de CoinGecko
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