<template>
  <div class="favorites-list">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold text-white">Seguimiento</h2>
      <span v-if="favoriteCoins.length > 0" class="text-sm text-gray-400">{{ favoriteCoins.length }} en total</span>
    </div>
    <div v-if="!isAuthenticated" class="text-gray-400 mt-8 text-center text-lg">
      Debes iniciar sesión para ver tus criptomonedas en seguimiento.
    </div>
    <div v-else-if="favoriteCoins.length === 0" class="text-gray-400 mt-8 text-center text-lg">
      No tienes criptomonedas en seguimiento.
    </div>
    <div v-else class="overflow-x-auto rounded-xl shadow bg-[#161b22] p-2">
      <table class="min-w-full text-sm text-left">
        <thead>
          <tr class="border-b border-[#23242a] bg-[#161b22]">
            <th class="py-3 px-4 text-gray-400 font-semibold">#</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">Nombre</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">Precio</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">Market Cap</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">Volumen (24h)</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">Supply</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">Últimos 7 días</th>
            <th class="py-3 px-4 text-gray-400 font-semibold">Quitar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(coin, index) in favoriteCoins" :key="coin.id" class="border-b border-[#23242a] hover:bg-[#23242a] transition">
            <td class="py-3 px-4">{{ index + 1 }}</td>
            <td class="py-3 px-4 flex items-center gap-2 min-w-[180px]">
              <img :src="coin.image" :alt="coin.name" class="w-7 h-7 rounded-full bg-white shadow" />
              <span class="font-semibold text-white">{{ coin.name }}</span>
              <span class="uppercase text-xs text-gray-400 ml-1">{{ coin.symbol }}</span>
            </td>
            <td class="py-3 px-4 text-green-400 font-semibold">${{ formatNumber(coin.current_price) }}</td>
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
            <td class="py-3 px-4">
              <button @click="removeFavorite(coin.id)" class="text-red-400 hover:text-red-600 font-bold text-lg ml-2">Quitar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getBackendPrices } from '../services/api';
import { FavoritesService } from '../services/favorites';

export default {
  name: 'FavoritesList',
  data() {
    return {
      favorites: [],
      favoriteCoins: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
      retryCount: 0
    }
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('token');
      this.isAuthenticated = !!token;
      return this.isAuthenticated;
    },
    async fetchFavorites() {
      if (!this.checkAuth()) return;
      
      try {
        const data = await FavoritesService.getFavorites();
        this.favorites = Array.isArray(data) ? data.map(fav => fav.coin_id) : [];
      } catch (e) {
        console.error('Error al obtener favoritos:', e);
        if (e.response && e.response.status === 401) {
          localStorage.removeItem('token');
          this.isAuthenticated = false;
        }
        this.favorites = [];
      }
    },
    async fetchFavoriteCoins() {
      if (!this.checkAuth()) {
        this.favoriteCoins = [];
        return;
      }

      if (this.isLoading) return;
      this.isLoading = true;
      this.error = null;

      try {
        await this.fetchFavorites();
        if (this.favorites.length === 0) {
          this.favoriteCoins = [];
          return;
        }
        // Usar el backend para obtener los precios
        const data = await getBackendPrices(this.favorites);
        if (!Array.isArray(data)) {
          throw new Error('Formato de respuesta inválido');
        }
        this.favoriteCoins = data;
      } catch (e) {
        console.error('Error al obtener datos de las criptomonedas favoritas:', e);
        this.error = e.message;
        this.favoriteCoins = [];
        // Intentar una segunda vez después de un breve retraso si falla
        if (!this.retryCount) {
          this.retryCount = 1;
          setTimeout(() => {
            this.retryCount = 0;
            this.fetchFavoriteCoins();
          }, 2000);
        }
      } finally {
        this.isLoading = false;
      }
    },
    async removeFavorite(id) {
      if (!this.checkAuth()) return;

      try {
        await FavoritesService.removeFavorite(id);
        this.favorites = this.favorites.filter(fid => fid !== id);
        await this.fetchFavoriteCoins();
      } catch (error) {
        console.error('Error al eliminar favorito:', error);
        this.error = 'Error al eliminar favorito. Por favor, intenta de nuevo.';
      }
    },
    async addFavorite(id) {
      console.log('Agregando favorito:', id);
      await FavoritesService.addFavorite(id);
      await this.fetchFavoriteCoins();
      window.dispatchEvent(new Event('storage'));
    },
    syncFavorites() {
      if (!this.isLoading) {
        this.fetchFavoriteCoins();
      }
    },
    getSparklinePoints(prices) {
      if (!prices || prices.length === 0) return '';
      const max = Math.max(...prices);
      const min = Math.min(...prices);
      const norm = prices.map(p => (p - min) / (max - min || 1));
      return norm.map((v, i) => `${i * (80 / (prices.length - 1))},${24 - v * 20}`).join(' ');
    },
    formatNumber(val) {
      if (!val && val !== 0) return '-';
      return val.toLocaleString('es-ES');
    }
  },
  mounted() {
    this.checkAuth();
    this.fetchFavoriteCoins();
    window.addEventListener('storage', this.syncFavorites);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.syncFavorites);
  },
  watch: {
    favorites: {
      handler(newVal) {
        if (newVal.length > 0 && !this.isLoading) {
          this.fetchFavoriteCoins();
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.favorites-list {
  margin-top: 2rem;
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
tr:hover {
  background: #23242a;
}
</style> 