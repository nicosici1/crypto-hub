import axios from 'axios';
import axiosBackend from 'axios';

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos en milisegundos
const cache = new Map();

const api = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

export const backendApi = axiosBackend.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
});

// Sistema de caché
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCacheData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Función para manejar reintentos con delay exponencial
const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
  try {
    const response = await api.get(url, options);
    return response.data;
  } catch (error) {
    if (retries === 0) {
      throw error;
    }

    // Si es un error de rate limit, esperamos más tiempo
    const isRateLimit = error.response?.status === 429;
    const waitTime = isRateLimit ? delay * 2 : delay;

    await new Promise(resolve => setTimeout(resolve, waitTime));
    return fetchWithRetry(url, options, retries - 1, waitTime * 2);
  }
};

export default {
  async getMarkets(coinIds = [], currency = 'usd') {
    try {
      const ids = Array.isArray(coinIds) ? coinIds.join(',') : coinIds;
      const cacheKey = `markets-${ids}-${currency}`;
      
      // Intentar obtener datos del caché
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const params = {
        vs_currency: currency,
        ids: ids,
        per_page: coinIds.length,
        page: 1,
        sparkline: false,
        price_change_percentage: '1h,24h,7d'
      };

      const queryString = new URLSearchParams(params).toString();
      const data = await fetchWithRetry(`/coins/markets?${queryString}`);
      
      // Guardar en caché
      setCacheData(cacheKey, data);
      return data;

    } catch (error) {
      console.error('Error fetching market data:', error);
      // Si hay un error de CORS o rate limit, intentar usar datos en caché aunque hayan expirado
      const cacheKey = `markets-${Array.isArray(coinIds) ? coinIds.join(',') : coinIds}-${currency}`;
      const expiredCache = cache.get(cacheKey);
      if (expiredCache) {
        console.warn('Using expired cache data due to API error');
        return expiredCache.data;
      }
      throw error;
    }
  },

  async getCoinData(coinId) {
    try {
      const cacheKey = `coin-${coinId}`;
      
      // Intentar obtener datos del caché
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const data = await fetchWithRetry(`/coins/${coinId}`);
      
      // Guardar en caché
      setCacheData(cacheKey, data);
      return data;

    } catch (error) {
      console.error('Error fetching coin data:', error);
      // Intentar usar caché expirado en caso de error
      const expiredCache = cache.get(`coin-${coinId}`);
      if (expiredCache) {
        console.warn('Using expired cache data due to API error');
        return expiredCache.data;
      }
      throw error;
    }
  }
};

export async function getBackendPrices(coinIds = []) {
  if (!Array.isArray(coinIds)) coinIds = [coinIds];
  const ids = coinIds.join(',');
  const res = await backendApi.get(`/prices?ids=${ids}`);
  return res.data;
} 