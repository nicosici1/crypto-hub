<template>
  <div class="crypto-detail bg-[#161b22] min-h-screen">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="w-8 h-8 border-2 border-[#16c784] border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen p-4">
      <div class="text-red-500 text-xl font-bold mb-4">{{ error }}</div>
      <button 
        @click="retryFetch" 
        class="px-6 py-3 bg-[#16c784] text-white font-bold rounded-lg hover:bg-[#13a06b] transition"
      >
        Reintentar
      </button>
    </div>
    
    <div v-else-if="coin" class="max-w-7xl mx-auto p-6 sm:p-8 w-full">
      <!-- Header con navegación -->
      <div class="flex items-center gap-4 mb-8">
        <button @click="$router.go(-1)" class="flex items-center gap-2 text-gray-400 hover:text-white transition">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
      </div>

      <!-- Información principal -->
      <div class="bg-[#161b22] rounded-2xl p-4 sm:p-8 mb-8 w-full">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 w-full">
          <div class="flex items-center gap-4 w-full">
            <img :src="coin.image?.large" :alt="coin.name" class="w-16 h-16 rounded-full bg-white shadow-lg" />
            <div>
              <h1 class="text-3xl font-bold text-white mb-1">{{ coin.name }}</h1>
              <p class="text-gray-400 text-lg">{{ coin.symbol?.toUpperCase() }}</p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row items-stretch gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <button @click="toggleFavorite" :class="[
              'px-4 py-2 rounded-lg transition flex items-center gap-2 w-full sm:w-auto justify-center',
              isFavorite ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-[#23242a] text-gray-400 hover:text-white'
            ]">
              <span>{{ isFavorite ? '★' : '☆' }}</span>
              {{ isFavorite ? 'En favoritos' : 'Agregar a favoritos' }}
            </button>
            <button @click="addToPortfolio" class="px-6 py-2 bg-[#16c784] text-white rounded-lg hover:bg-[#13a06b] transition flex items-center gap-2 w-full sm:w-auto justify-center">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
              </svg>
              Agregar transacción
            </button>
          </div>
        </div>
      </div>

      <!-- Precio y estadísticas principales -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-[#161b22] rounded-2xl p-6">
          <h3 class="text-gray-400 text-sm mb-2">Precio actual</h3>
          <div class="text-3xl font-bold text-white mb-2">${{ formatNumber(coin.market_data?.current_price?.usd) }}</div>
          <div :class="[
            'flex items-center gap-2 text-lg font-medium',
            getPriceChangeClass(coin.market_data?.price_change_percentage_24h)
          ]">
            <svg class="w-5 h-5" :class="getPriceChangeIcon(coin.market_data?.price_change_percentage_24h)" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            {{ formatPercent(coin.market_data?.price_change_percentage_24h) }} (24h)
          </div>
        </div>

        <div class="bg-[#161b22] rounded-2xl p-6">
          <h3 class="text-gray-400 text-sm mb-2">Market Cap</h3>
          <div class="text-2xl font-bold text-white mb-2">${{ formatNumber(coin.market_data?.market_cap?.usd) }}</div>
          <div class="text-gray-400 text-sm">Rank #{{ coin.market_cap_rank }}</div>
        </div>

        <div class="bg-[#161b22] rounded-2xl p-6">
          <h3 class="text-gray-400 text-sm mb-2">Volumen (24h)</h3>
          <div class="text-2xl font-bold text-white mb-2">${{ formatNumber(coin.market_data?.total_volume?.usd) }}</div>
          <div class="text-gray-400 text-sm">Supply: {{ formatNumber(coin.market_data?.circulating_supply) }}</div>
        </div>
      </div>

      <!-- Gráfico de precios -->
      <div class="bg-[#161b22] rounded-2xl p-6 mb-8">
        <h3 class="text-xl font-bold text-white mb-4">Precio en los últimos 7 días</h3>
        <div class="h-64 flex items-center justify-center">
          <svg v-if="sparklineData" width="100%" height="100%" viewBox="0 0 800 200" class="max-w-full">
            <polyline
              :points="sparklineData"
              fill="none"
              stroke="#16c784"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <div v-else class="text-gray-400">No hay datos del gráfico disponibles</div>
        </div>
      </div>

      <!-- Estadísticas detalladas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-[#161b22] rounded-2xl p-6">
          <h3 class="text-xl font-bold text-white mb-4">Estadísticas de precio</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Precio más alto (24h)</span>
              <span class="text-white font-medium">${{ formatNumber(coin.market_data?.high_24h?.usd) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Precio más bajo (24h)</span>
              <span class="text-white font-medium">${{ formatNumber(coin.market_data?.low_24h?.usd) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Cambio 1h</span>
              <span :class="getPriceChangeClass(coin.market_data?.price_change_percentage_1h_in_currency)">
                {{ formatPercent(coin.market_data?.price_change_percentage_1h_in_currency) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Cambio 7d</span>
              <span :class="getPriceChangeClass(coin.market_data?.price_change_percentage_7d_in_currency)">
                {{ formatPercent(coin.market_data?.price_change_percentage_7d_in_currency) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Cambio 30d</span>
              <span :class="getPriceChangeClass(coin.market_data?.price_change_percentage_30d_in_currency)">
                {{ formatPercent(coin.market_data?.price_change_percentage_30d_in_currency) }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-[#161b22] rounded-2xl p-6">
          <h3 class="text-xl font-bold text-white mb-4">Información del mercado</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Supply circulante</span>
              <span class="text-white font-medium">{{ formatNumber(coin.market_data?.circulating_supply) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Supply total</span>
              <span class="text-white font-medium">{{ formatNumber(coin.market_data?.total_supply) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Supply máximo</span>
              <span class="text-white font-medium">{{ formatNumber(coin.market_data?.max_supply) || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Cap. de mercado total</span>
              <span class="text-white font-medium">${{ formatNumber(coin.market_data?.market_cap?.usd) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Volumen total (24h)</span>
              <span class="text-white font-medium">${{ formatNumber(coin.market_data?.total_volume?.usd) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Descripción -->
      <div v-if="coin.description?.en" class="bg-[#161b22] rounded-2xl p-6 mb-8">
        <h3 class="text-xl font-bold text-white mb-4">Acerca de {{ coin.name }}</h3>
        <div class="text-gray-300 leading-relaxed" v-html="cleanDescription(coin.description.en)"></div>
      </div>

      <!-- Enlaces -->
      <div class="bg-[#161b22] rounded-2xl p-6">
        <h3 class="text-xl font-bold text-white mb-4">Enlaces oficiales</h3>
        <div class="flex flex-wrap gap-3">
          <a v-if="coin.links?.homepage?.[0]" 
             :href="coin.links.homepage[0]" 
             target="_blank" 
             class="px-4 py-2 bg-[#23242a] text-white rounded-lg hover:bg-[#2d2f36] transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 101.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
            </svg>
            Sitio web
          </a>
          <a v-if="coin.links?.blockchain_site?.[0]" 
             :href="coin.links.blockchain_site[0]" 
             target="_blank" 
             class="px-4 py-2 bg-[#23242a] text-white rounded-lg hover:bg-[#2d2f36] transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
            Blockchain
          </a>
          <a v-if="coin.links?.repos_url?.github?.[0]" 
             :href="coin.links.repos_url.github[0]" 
             target="_blank" 
             class="px-4 py-2 bg-[#23242a] text-white rounded-lg hover:bg-[#2d2f36] transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { FavoritesService } from '../services/favorites';

// Caché global para evitar requests duplicados
const coinCache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

export default {
  name: 'CryptoDetail',
  props: {
    coinId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      coin: null,
      loading: true,
      error: null,
      isFavorite: false,
      retryCount: 0,
      maxRetries: 2,
      lastRequestTime: 0,
      minRequestInterval: 1000 // 1 segundo mínimo entre requests
    }
  },
  computed: {
    sparklineData() {
      if (!this.coin?.market_data?.sparkline_7d?.price) return null;
      const prices = this.coin.market_data.sparkline_7d.price;
      const max = Math.max(...prices);
      const min = Math.min(...prices);
      const norm = prices.map(p => (p - min) / (max - min || 1));
      return norm.map((v, i) => `${i * (800 / (prices.length - 1))},${200 - v * 180}`).join(' ');
    }
  },
  methods: {
    async fetchCoinData() {
      this.loading = true;
      this.error = null;
      
      // Verificar caché global
      const cacheKey = this.coinId;
      const cached = coinCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        this.coin = cached.data;
        this.loading = false;
        await this.checkFavoriteStatus();
        return;
      }
      
      try {
        const proxy = 'https://corsproxy.io/?';
        const url = `https://api.coingecko.com/api/v3/coins/${this.coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`;
        
        const currentTime = Date.now();
        const timeSinceLastRequest = currentTime - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.minRequestInterval) {
          await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
        }
        
        this.lastRequestTime = Date.now();
        
        const response = await fetch(proxy + url);
        
        if (response.status === 429) {
          // Rate limit - esperar y reintentar
          if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            const waitTime = Math.min(2000 * Math.pow(2, this.retryCount - 1), 10000); // Backoff exponencial, máximo 10s
            console.log(`Rate limit alcanzado. Reintentando en ${waitTime}ms (intento ${this.retryCount}/${this.maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.fetchCoinData();
          } else {
            throw new Error('Demasiadas solicitudes. Intenta de nuevo en unos minutos.');
          }
        }
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        this.coin = await response.json();
        this.retryCount = 0; // Reset retry count on success
        
        // Guardar en caché global
        coinCache.set(cacheKey, {
          data: this.coin,
          timestamp: Date.now()
        });
        
        await this.checkFavoriteStatus();
      } catch (error) {
        console.error('Error fetching coin data:', error);
        this.error = error.message || 'No se pudieron cargar los datos de la criptomoneda';
      } finally {
        this.loading = false;
      }
    },
    
    async checkFavoriteStatus() {
      try {
        // Solo verificar favoritos si el usuario está autenticado
        const token = localStorage.getItem('token');
        if (!token) {
          this.isFavorite = false;
          return;
        }
        
        this.isFavorite = await FavoritesService.isFavorite(this.coinId);
      } catch (error) {
        console.error('Error checking favorite status:', error);
        this.isFavorite = false; // Default to false on error
      }
    },
    
    async toggleFavorite() {
      try {
        // Verificar autenticación antes de hacer cambios
        const token = localStorage.getItem('token');
        if (!token) {
          this.$router.push('/perfil');
          return;
        }
        
        if (this.isFavorite) {
          await FavoritesService.removeFavorite(this.coinId);
        } else {
          await FavoritesService.addFavorite(this.coinId);
        }
        this.isFavorite = !this.isFavorite;
      } catch (error) {
        console.error('Error toggling favorite:', error);
        // No cambiar el estado si hay error
      }
    },
    
    addToPortfolio() {
      this.$router.push(`/portfolio?add=${this.coinId}`);
    },
    
    formatNumber(value) {
      if (!value && value !== 0) return 'N/A';
      if (typeof value !== 'number') return 'N/A';
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        notation: value > 1000000 ? 'compact' : 'standard'
      }).format(value);
    },
    
    formatPercent(value) {
      if (!value && value !== 0) return 'N/A';
      if (typeof value !== 'number') return 'N/A';
      return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    },
    
    getPriceChangeClass(value) {
      if (!value && value !== 0) return 'text-gray-400';
      if (typeof value !== 'number') return 'text-gray-400';
      return value >= 0 ? 'text-[#16c784]' : 'text-red-500';
    },
    
    getPriceChangeIcon(value) {
      if (!value && value !== 0) return 'rotate-0';
      if (typeof value !== 'number') return 'rotate-0';
      return value >= 0 ? 'rotate-0' : 'rotate-180';
    },
    
    cleanDescription(description) {
      if (!description) return '';
      // Limpiar HTML y limitar a 500 caracteres
      const clean = description.replace(/<[^>]*>/g, '');
      return clean.length > 500 ? clean.substring(0, 500) + '...' : clean;
    },
    
    async retryFetch() {
      this.retryCount = 0; // Reset retry count
      this.error = null;
      await this.fetchCoinData();
    }
  },
  
  mounted() {
    this.fetchCoinData();
  },
  
  watch: {
    coinId() {
      this.fetchCoinData();
    }
  }
}
</script>
