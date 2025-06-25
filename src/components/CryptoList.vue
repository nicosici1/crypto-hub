<template>
  <div class="w-full lg:max-w-[1400px] mx-auto">
    <!-- Barra de filtros -->
    <div class="flex flex-wrap items-center gap-2 mb-4 mt-4">
      <button
        v-for="f in filters"
        :key="f.value"
        @click="setFilter(f.value)"
        :class="[
          'px-4 py-1 rounded font-semibold transition',
          filter === f.value
            ? 'bg-[#16c784] text-white font-bold shadow hover:bg-[#13a06b]'
            : 'bg-[#23242a] text-gray-200 hover:bg-[#2d2f36]'
        ]"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Desktop Table -->
    <div class="overflow-x-auto rounded-xl shadow mt-4 hidden sm:block">
      <table class="min-w-full text-sm text-left">
        <thead>
          <tr class="border-b border-[#23242a] bg-[#161b22]">
            <th class="py-3 px-4 text-gray-400 font-semibold"></th>
            <th class="py-3 px-4 text-gray-400 font-semibold">#</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">Nombre</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">Precio</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">1h %</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">24h %</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">7d %</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">Market Cap</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">Volumen (24h)</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">Supply</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">Últimos 7 días</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(coin, index) in filteredCoins" :key="coin.id" 
              class="border-b border-[#23242a] hover:bg-[#23242a] transition cursor-pointer"
              @click="goToDetail(coin.id)">
            <td class="py-3 px-4" @click.stop="toggleFavorite(coin.id)">
              <button :class="isFavorite(coin.id) ? 'text-yellow-400' : 'text-gray-400'">
                <span v-if="isFavorite(coin.id)">★</span>
                <span v-else>☆</span>
              </button>
            </td>
            <td class="py-3 px-4">{{ (page - 1) * perPage + index + 1 }}</td>
            <td class="py-3 px-4 flex items-center gap-2 min-w-[180px]">
              <img :src="coin.image" :alt="coin.name" class="w-7 h-7 rounded-full bg-white shadow" />
              <span class="font-semibold text-gray-100">{{ coin.name }}</span>
              <span class="uppercase text-xs text-gray-400 ml-1">{{ coin.symbol }}</span>
            </td>
            <td class="py-3 px-4">${{ formatNumber(coin.current_price) }}</td>
            <td class="py-3 px-4" :class="getClass(coin.price_change_percentage_1h_in_currency)">
              {{ formatPercent(coin.price_change_percentage_1h_in_currency) }}
            </td>
            <td class="py-3 px-4" :class="getClass(coin.price_change_percentage_24h_in_currency)">
              {{ formatPercent(coin.price_change_percentage_24h_in_currency) }}
            </td>
            <td class="py-3 px-4" :class="getClass(coin.price_change_percentage_7d_in_currency)">
              {{ formatPercent(coin.price_change_percentage_7d_in_currency) }}
            </td>
            <td class="py-3 px-4">${{ formatNumber(coin.market_cap) }}</td>
            <td class="py-3 px-4">${{ formatNumber(coin.total_volume) }}</td>
            <td class="py-3 px-4">{{ formatNumber(coin.circulating_supply) }}</td>
            <td class="py-3 px-4">
              <svg v-if="coin.sparkline_in_7d && coin.sparkline_in_7d.price" width="80" height="24" viewBox="0 0 80 24">
                <polyline
                  :points="getSparklinePoints(coin.sparkline_in_7d.price)"
                  fill="none"
                  stroke="#ea3943"
                  stroke-width="2"
                />
              </svg>
              <span v-else class="text-gray-400 text-xs">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Mobile Cards -->
    <div class="block sm:hidden mt-4 space-y-3">
      <div v-for="(coin, index) in filteredCoins" :key="coin.id" 
           class="bg-[#161b22] rounded-xl shadow p-4 w-full flex items-center gap-3 cursor-pointer hover:bg-[#23242a] transition"
           @click="goToDetail(coin.id)">
        <span class="text-gray-400 font-bold w-5">{{ (page - 1) * perPage + index + 1 }}</span>
        <img :src="coin.image" :alt="coin.name" class="w-8 h-8 rounded-full bg-white shadow" />
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white">{{ coin.name }}</span>
            <span class="uppercase text-xs text-gray-400">{{ coin.symbol }}</span>
          </div>
        </div>
        <div class="text-right">
          <div class="text-white font-semibold">${{ formatNumber(coin.current_price) }}</div>
          <div :class="getClass(coin.price_change_percentage_1h_in_currency) + ' text-xs flex items-center gap-1 justify-end'">
            <span>{{ formatPercent(coin.price_change_percentage_1h_in_currency) }}</span>
            <span v-if="coin.price_change_percentage_1h_in_currency > 0" class="text-green-400">▲</span>
            <span v-else-if="coin.price_change_percentage_1h_in_currency < 0" class="text-red-400">▼</span>
          </div>
          <button @click.stop="toggleFavorite(coin.id)" :class="isFavorite(coin.id) ? 'text-yellow-400' : 'text-gray-400'">
            <span v-if="isFavorite(coin.id)">★</span>
            <span v-else>☆</span>
          </button>
        </div>
      </div>
    </div>
    <!-- Paginación abajo -->
    <div class="flex flex-col items-center justify-center mt-6 mb-2">
      <div class="flex items-center gap-2">
        <button @click="prevPage" :disabled="page === 1" class="px-3 py-1 rounded bg-[#23242a] text-gray-200 font-bold disabled:opacity-50 hover:bg-[#2d2f36] transition">Anterior</button>
        <div class="flex items-center gap-1">
          <button 
            v-for="pageNum in displayedPages" 
            :key="pageNum"
            @click="goToPage(pageNum)"
            :class="[
              'px-3 py-1 rounded font-bold transition',
              pageNum === page 
                ? 'bg-[#16c784] text-white' 
                : 'bg-[#23242a] text-gray-200 hover:bg-[#2d2f36]'
            ]"
          >
            {{ pageNum }}
          </button>
        </div>
        <button @click="nextPage" :disabled="page === totalPages" class="px-3 py-1 rounded bg-[#23242a] text-gray-200 font-bold disabled:opacity-50 hover:bg-[#2d2f36] transition">Siguiente</button>
      </div>
      <div class="text-gray-400 text-sm mt-2">
        Página <span class="font-bold text-white">{{ page }}</span> de <span class="font-bold text-white">{{ totalPages }}</span>
      </div>
    </div>
    <div v-if="loading" class="mt-4 text-gray-400 text-center">Cargando datos...</div>
    <div v-if="error" class="mt-4 text-center">
      <div class="text-red-500 mb-4">{{ error }}</div>
      <button 
        @click="retryFetch" 
        class="px-6 py-3 bg-[#16c784] text-white font-bold rounded-lg hover:bg-[#13a06b] transition"
      >
        Reintentar
      </button>
    </div>
  </div>
</template>

<script>
import { FavoritesService } from '../services/favorites';

// Caché global para evitar requests duplicados
const listCache = new Map();
const LIST_CACHE_DURATION = 3 * 60 * 1000; // 3 minutos

export default {
  name: 'CryptoList',
  data() {
    return {
      coins: [],
      loading: false,
      error: null,
      page: 1,
      perPage: 50,
      total: 0,
      filter: 'all',
      filters: [
        { label: 'Todo', value: 'all' },
        { label: 'Top 10', value: 'top10' },
        { label: 'Ganadoras 24h', value: 'winners' },
        { label: 'Perdedoras 24h', value: 'losers' },
        { label: 'Favoritas', value: 'favorites' }
      ],
      favorites: [],
      retryCount: 0,
      maxRetries: 3
    }
  },
  computed: {
    totalPages() {
      // CoinGecko tiene más de 10.000 monedas, pero limitamos a 200 páginas para evitar abuso
      return Math.min(Math.ceil(this.total / this.perPage), 200) || 1;
    },
    displayedPages() {
      const pages = [];
      const maxVisiblePages = 5;
      let start = Math.max(1, this.page - Math.floor(maxVisiblePages / 2));
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    },
    filteredCoins() {
      let filtered = Array.isArray(this.coins) ? [...this.coins] : [];
      if (this.filter === 'top10') {
        filtered = filtered.slice(0, 10);
      } else if (this.filter === 'winners') {
        filtered = filtered.filter(c => c.price_change_percentage_24h_in_currency > 0);
      } else if (this.filter === 'losers') {
        filtered = filtered.filter(c => c.price_change_percentage_24h_in_currency < 0);
      } else if (this.filter === 'favorites') {
        filtered = filtered.filter(c => this.favorites.includes(c.id));
      }
      return filtered;
    }
  },
  methods: {
    async fetchCoins() {
      this.loading = true;
      this.error = null;
      
      // Verificar caché global
      const cacheKey = `page_${this.page}`;
      const cached = listCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < LIST_CACHE_DURATION) {
        this.coins = cached.data;
        this.total = 10000;
        this.loading = false;
        return;
      }
      
      try {
        const proxy = 'https://corsproxy.io/?';
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${this.perPage}&page=${this.page}&sparkline=true&price_change_percentage=1h%2C24h%2C7d`;
        const res = await fetch(proxy + encodeURIComponent(url));
        
        if (res.status === 429) {
          // Rate limit - esperar y reintentar
          if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            const waitTime = Math.min(2000 * Math.pow(2, this.retryCount - 1), 10000); // Backoff exponencial, máximo 10s
            console.log(`Rate limit alcanzado. Reintentando en ${waitTime}ms (intento ${this.retryCount}/${this.maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.fetchCoins();
          } else {
            throw new Error('Demasiadas solicitudes. Intenta de nuevo en unos minutos.');
          }
        }
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        this.coins = Array.isArray(data) ? data : [];
        this.total = 10000;
        this.retryCount = 0; // Reset retry count on success
        
        // Guardar en caché global
        listCache.set(cacheKey, {
          data: this.coins,
          timestamp: Date.now()
        });
      } catch (e) {
        this.error = e.message || 'Error al cargar datos';
        this.coins = [];
      } finally {
        this.loading = false;
      }
    },
    formatPercent(val) {
      return val ? val.toFixed(2) + '%' : '-';
    },
    getClass(val) {
      return val > 0 ? 'text-green-500' : val < 0 ? 'text-red-500' : 'text-gray-300';
    },
    formatNumber(val) {
      if (!val && val !== 0) return '-';
      return val.toLocaleString('es-ES');
    },
    nextPage() {
      if (this.page < this.totalPages) {
        this.page++;
        this.fetchCoins();
      }
    },
    prevPage() {
      if (this.page > 1) {
        this.page--;
        this.fetchCoins();
      }
    },
    goToPage(pageNum) {
      if (pageNum >= 1 && pageNum <= this.totalPages) {
        this.page = pageNum;
        this.fetchCoins();
      }
    },
    setFilter(f) {
      this.filter = f;
    },
    async fetchFavorites() {
      try {
        const data = await FavoritesService.getFavorites();
        this.favorites = data.map(fav => fav.coin_id);
      } catch (e) {
        console.error('Error al obtener favoritos:', e);
        this.favorites = [];
      }
    },
    async toggleFavorite(id) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Debes iniciar sesión para agregar favoritos');
          return;
        }

        if (this.favorites.includes(id)) {
          await FavoritesService.removeFavorite(id);
          this.favorites = this.favorites.filter(fid => fid !== id);
        } else {
          await FavoritesService.addFavorite(id);
          this.favorites.push(id);
        }
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error('Error al actualizar favoritos:', error);
        alert('Error al actualizar favoritos. Por favor, intenta de nuevo.');
      }
    },
    isFavorite(id) {
      return this.favorites.includes(id);
    },
    getSparklinePoints(prices) {
      if (!prices || prices.length === 0) return '';
      const max = Math.max(...prices);
      const min = Math.min(...prices);
      const norm = prices.map(p => (p - min) / (max - min || 1));
      return norm.map((v, i) => `${i * (80 / (prices.length - 1))},${24 - v * 20}`).join(' ');
    },
    goToDetail(id) {
      this.$router.push(`/moneda/${id}`);
    },
    async retryFetch() {
      await this.fetchCoins();
    }
  },
  watch: {
    filter(val) {
      if (val === 'favorites') {
        this.fetchFavorites();
      }
    }
  },
  mounted() {
    this.fetchCoins();
    this.fetchFavorites();
  }
}
</script>

<style scoped>
.crypto-list {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2.5rem 2.5rem 2.5rem;
  background: #161b22;
}
h2 {
  text-align: left;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
  margin-left: 0;
}
table {
  width: 100%;
  border-collapse: collapse;
  background: #161b22;
  font-size: 1.05rem;
}
th, td {
  padding: 0.7rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid #222;
}
th {
  color: #aaa;
  font-weight: 600;
  background: #161b22;
}
.coin-logo {
  width: 28px;
  height: 28px;
  vertical-align: middle;
  margin-right: 10px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px #0003;
}
.coin-name {
  display: flex;
  align-items: center;
}
.coin-title {
  font-weight: 600;
  margin-right: 4px;
}
.symbol {
  color: #888;
  font-size: 0.95em;
  margin-left: 2px;
}
.positive {
  color: #16c784;
}
.negative {
  color: #ea3943;
}
tr:hover {
  background: #23242a;
}
.loading {
  margin-top: 1rem;
  color: #aaa;
  text-align: center;
}
.error {
  margin-top: 1rem;
  color: #ea3943;
  text-align: center;
}
@media (max-width: 900px) {
  .crypto-list {
    padding: 0 1rem 1.2rem 1rem;
  }
  h2 {
    font-size: 1.2rem;
  }
}
@media (max-width: 600px) {
  .crypto-list {
    padding: 0 0.2rem 0.5rem 0.2rem;
  }
  h2 {
    font-size: 1.1rem;
  }
  table {
    font-size: 0.95rem;
    overflow-x: auto;
    display: block;
  }
}
</style> 