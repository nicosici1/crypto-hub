<template>
  <div class="portfolio-manager">
    <div v-if="!isAuthenticated" class="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#1a1c23] to-[#23242a] rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-[1.02]">
      <h2 class="text-3xl font-bold text-white mb-2">¡Bienvenido a tu Portfolio!</h2>
      <p class="text-gray-400 mb-4">Inicia sesión para gestionar tus carteras y ver tus métricas.</p>
      <button
        @click="$router.push('/profile')"
        class="bg-gradient-to-r from-[#16c784] to-[#13a06b] text-white font-bold py-3 px-4 rounded-xl hover:from-[#13a06b] hover:to-[#16c784] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
      >
        Iniciar Sesión
      </button>
    </div>
    <div v-else>
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div class="bg-[#23242a] rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-fadeIn">
          <h2 class="text-xl font-bold text-white mb-4">Eliminar activo</h2>
          <p class="text-gray-300 mb-4">¿Estás seguro que deseas eliminar <span class="font-bold text-white">{{ activoAEliminar?.name || activoAEliminar?.symbol }}</span> de tu portfolio? Esta acción eliminará todas las transacciones de este activo.</p>
          <div class="flex justify-end gap-2">
            <button @click="showDeleteModal = false" class="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600">Cancelar</button>
            <button @click="eliminarActivoConfirmado" class="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700">Eliminar</button>
          </div>
        </div>
      </div>
      <ModalTransaccion
        v-if="showEditModal"
        :edit-tx="editTx"
        @close="closeEditModal"
        @saved="onTxEdited"
      />
      
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="activosTabla && activosTabla.length === 0" class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">No hay activos</h3>
        <p class="text-gray-400 mb-6">Agrega tu primera transacción para comenzar a trackear tu portfolio</p>
        <button 
          @click="$emit('add-transaction')"
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/20"
        >
          Agregar transacción
        </button>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-800/30">
              <th class="text-left py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">NOMBRE</th>
              <th class="text-center py-3 px-3 text-gray-400 font-medium text-xs uppercase tracking-wider">ALERTAS</th>
              <th class="text-right py-3 px-3 text-gray-400 font-medium text-xs uppercase tracking-wider">1H%</th>
              <th class="text-right py-3 px-3 text-gray-400 font-medium text-xs uppercase tracking-wider">24H%</th>
              <th class="text-right py-3 px-3 text-gray-400 font-medium text-xs uppercase tracking-wider">7D%</th>
              <th class="text-right py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">INVERSIONES</th>
              <th class="text-right py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">PRECIO PROMEDIO DE COMPRA</th>
              <th class="text-right py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">GANANCIA/PÉRDIDA</th>
              <th class="text-center py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="asset in activosTabla" 
              :key="asset.id"
              class="border-b border-gray-800/20 hover:bg-gray-800/10 transition-colors group"
            >
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <img v-if="asset.image" :src="asset.image" :alt="asset.name" class="w-8 h-8 rounded-full bg-white shadow" />
                  <div v-else :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs',
                    getCryptoColor(asset.symbol ? asset.symbol : '')
                  ]">
                    {{ (((asset.symbol || '?').charAt(0) || '?') + '').toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-medium text-white text-sm">{{ asset.name }}</div>
                    <div class="text-xs text-gray-400">{{ (asset.symbol || '?').toUpperCase() }}</div>
                  </div>
                </div>
              </td>
              
              <td class="py-3 px-3 text-right">
                <div class="text-white font-medium text-sm">{{ formatCurrency(asset.current_price) }}</div>
              </td>
              
              <td class="py-3 px-3 text-right">
                <div :class="[
                  'flex items-center justify-end gap-1 text-xs font-medium',
                  asset.price_change_percentage_1h >= 0 ? 'text-emerald-400' : 'text-red-400'
                ]">
                  <svg class="w-2.5 h-2.5" :class="asset.price_change_percentage_1h >= 0 ? 'rotate-0' : 'rotate-180'" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  {{ formatPercentage(asset.price_change_percentage_1h) }}
                </div>
              </td>
              
              <td class="py-3 px-3 text-right">
                <div :class="[
                  'flex items-center justify-end gap-1 text-xs font-medium',
                  asset.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                ]">
                  <svg class="w-2.5 h-2.5" :class="asset.price_change_percentage_24h >= 0 ? 'rotate-0' : 'rotate-180'" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  {{ formatPercentage(asset.price_change_percentage_24h) }}
                </div>
              </td>
              
              <td class="py-3 px-3 text-right">
                <div :class="[
                  'flex items-center justify-end gap-1 text-xs font-medium',
                  asset.price_change_percentage_7d >= 0 ? 'text-emerald-400' : 'text-red-400'
                ]">
                  <svg class="w-2.5 h-2.5" :class="asset.price_change_percentage_7d >= 0 ? 'rotate-0' : 'rotate-180'" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  {{ formatPercentage(asset.price_change_percentage_7d) }}
                </div>
              </td>
              
              <td class="py-3 px-4 text-right">
                <div class="text-white font-medium text-sm">{{ formatCurrency(asset.totalInvested) }}</div>
                <div class="text-xs text-gray-400">{{ formatNumber(asset.totalAmount) }} {{ (asset.symbol || '?').toUpperCase() }}</div>
              </td>
              
              <td class="py-3 px-4 text-right">
                <div class="text-white font-medium text-sm">{{ formatCurrency(asset.averagePrice) }}</div>
              </td>
              
              <td class="py-3 px-4 text-right">
                <div :class="[
                  'font-medium flex items-center justify-end gap-1 text-sm',
                  asset.totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'
                ]">
                  <svg class="w-3 h-3" :class="asset.totalGain >= 0 ? 'rotate-0' : 'rotate-180'" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  {{ asset.totalGain >= 0 ? '+' : '' }}{{ formatCurrency(Math.abs(asset.totalGain)) }}
                </div>
                <div :class="[
                  'text-xs font-medium',
                  asset.totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'
                ]">
                  {{ asset.totalGain >= 0 ? '' : '' }}{{ formatPercentage(asset.gainPercentage) }}
                </div>
              </td>
              
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button 
                    @click="$emit('add-transaction', asset)"
                    class="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors"
                    title="Agregar transacción"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <button 
                    @click="abrirModalEliminarActivo(asset)"
                    class="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Más opciones"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import ModalTransaccion from './ModalTransaccion.vue';
import { TransactionService } from '../services/transactions';
import { backendApi } from '../services/api';

export default {
  name: 'PortfolioManager',
  components: { ModalTransaccion },
  props: {
    carteraFiltro: {
      type: [Number, String],
      default: null
    },
    activos: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      showEditModal: false,
      editTx: null,
      isLoading: false,
      error: null,
      priceCache: {},
      lastApiCall: 0,
      apiCallDelay: 6000,
      portfolioKey: 0,
      showDeleteModal: false,
      activoAEliminar: null,
      email: '',
      password: ''
    }
  },
  computed: {
    user() {
      return this.$store && this.$store.state && this.$store.state.auth && this.$store.state.auth.user;
    },
    isAuthenticated() {
      return !!localStorage.getItem('token');
    },
    totalValue() {
      if (!this.portfolioSummary) return 0;
      return this.portfolioSummary.totalValue || 0;
    },
    totalProfit() {
      if (!this.portfolioSummary) return 0;
      return this.portfolioSummary.totalProfit || 0;
    },
    profitPercentage() {
      if (!this.portfolioSummary || !this.totalValue) return 0;
      return (this.totalProfit / this.totalValue) * 100;
    },
    activosTabla() {
      return Array.isArray(this.activos) ? this.activos.map(asset => {
        const currentValue = asset.totalAmount * asset.current_price;
        const totalInvested = asset.totalAmount * asset.averagePrice;
        const totalGain = currentValue - totalInvested;
        const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
        
        return {
          ...asset,
          totalGain: totalGain,
          gainPercentage: gainPercentage,
          totalInvested: currentValue // Valor actual de mercado
        };
      }) : [];
    }
  },
  methods: {
    formatCurrency(val) {
      if (val === null || val === undefined || isNaN(val)) return '-';
      return val ? val.toLocaleString('es-ES', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }) : '$0';
    },
    formatNumber(val) {
      if (val === null || val === undefined || isNaN(val)) return '-';
      return val.toLocaleString('es-ES', { maximumFractionDigits: 8 });
    },
    formatPercentage(val) {
      if (val === null || val === undefined || isNaN(val)) return '-';
      return (val ? val.toFixed(2) : '0.00') + '%';
    },
    getCryptoColor(symbol) {
      if (!symbol || typeof symbol !== 'string') return 'bg-gray-500';
      switch (symbol.toLowerCase()) {
        case 'btc':
        case 'bitcoin':
          return 'bg-yellow-400';
        case 'eth':
        case 'ethereum':
          return 'bg-indigo-500';
        default:
          return 'bg-gray-500';
      }
    },
    async loadPortfolio() {
      this.isLoading = true;
      this.error = null;
      try {
        const transactions = this.carteraFiltro
          ? await TransactionService.getTransactionsByPortfolio(this.carteraFiltro)
          : await TransactionService.getTransactions();
        this.portfolioData = await this.procesarTransacciones(transactions);
      } catch (error) {
        console.error('Error al cargar el portfolio:', error);
        this.error = 'Error al cargar el portfolio. Por favor, intenta de nuevo.';
        this.portfolioData = [];
      } finally {
        this.isLoading = false;
      }
    },
    async procesarTransacciones(transactions) {
      const activos = {};
      // Procesar transacciones
      transactions.forEach(tx => {
        const symbol = tx.coin_symbol || tx.coin?.symbol || '?';
        const name = tx.coin_name || tx.coin?.name || '?';
        const coinId = tx.coin_id || tx.coin?.id || symbol;
        const image = tx.coin_image || tx.coin?.image;
        if (!activos[coinId]) {
          activos[coinId] = {
            id: coinId,
            symbol,
            name,
            image,
            totalAmount: 0,
            totalInvested: 0,
            totalSold: 0,
            averagePrice: 0,
            totalGain: 0,
            gainPercentage: 0
          };
        }
        const activo = activos[coinId];
        const amount = Number(tx.amount) || 0;
        const price = Number(tx.price) || 0;
        if (tx.type === 'buy') {
          activo.totalAmount += amount;
          activo.totalInvested += amount * price;
        } else if (tx.type === 'sell') {
          activo.totalAmount -= amount;
          activo.totalSold += amount * price;
        }
      });
      // Calcular métricas finales
      return Object.values(activos)
        .filter(activo => activo.totalAmount > 0)
        .map(activo => {
          activo.averagePrice = activo.totalAmount > 0 ? activo.totalInvested / activo.totalAmount : 0;
          // No calculamos precios de mercado aquí
          return activo;
        });
    },
    async saveTransaction(transaction) {
      try {
        if (this.editTx) {
          await TransactionService.updateTransaction(this.editTx.id, transaction);
        } else {
          await TransactionService.addTransaction(transaction);
        }
        await this.loadPortfolio();
        this.showEditModal = false;
        this.editTx = null;
        this.$emit('portfolio-updated');
      } catch (error) {
        console.error('Error al guardar la transacción:', error);
        this.error = 'Error al guardar la transacción. Por favor, intenta de nuevo.';
      }
    },
    async deleteTransaction(id) {
      if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) return;

      try {
        await TransactionService.deleteTransaction(id);
        await this.loadPortfolio();
      } catch (error) {
        console.error('Error al eliminar la transacción:', error);
        this.error = 'Error al eliminar la transacción. Por favor, intenta de nuevo.';
      }
    },
    editTransaction(transaction) {
      this.editTx = { ...transaction };
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.editTx = null;
    },
    onTxEdited() {
      this.$emit('portfolio-updated');
      this.closeEditModal();
    },
    calculateTotals() {
      // Implementa la lógica para calcular totales
    },
    async onPortfolioUpdated() {
      await this.loadPortfolio();
      this.portfolioKey++;
    },
    abrirModalEliminarActivo(asset) {
      this.activoAEliminar = asset;
      this.showDeleteModal = true;
    },
    async eliminarActivoConfirmado() {
      if (!this.activoAEliminar) return;
      
      if (!this.carteraFiltro) {
        alert('Por favor, selecciona una cartera antes de eliminar un activo.');
        this.showDeleteModal = false;
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No autorizado');
        }

        await backendApi.delete(
          `/transactions?portfolio_id=${this.carteraFiltro}&coin_id=${this.activoAEliminar.id || this.activoAEliminar.coin_id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        this.showDeleteModal = false;
        this.activoAEliminar = null;
        this.$emit('portfolio-updated');
      } catch (error) {
        console.error('Error al eliminar el activo:', error);
        alert('Error al eliminar el activo. Por favor, intenta de nuevo.');
      }
    },
    async login() {
      try {
        // Llamar al método de autenticación del store
        await this.$store.dispatch('auth/login', { email: this.email, password: this.password });
        await this.loadPortfolio();
        this.$router.push('/portfolio');
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        this.error = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
      }
    }
  },
  watch: {
    carteraFiltro() {
      this.loadPortfolio();
    },
    isAuthenticated(newVal) {
      if (newVal) {
        this.loadPortfolio();
      } else {
        this.portfolioData = [];
        this.portfolioSummary = null;
      }
    }
  },
  mounted() {
    this.loadPortfolio();
  }
}
</script>

<style scoped>
.portfolio-manager {
  @apply w-full;
}

/* Mejorar la apariencia de la tabla en dispositivos pequeños */
@media (max-width: 768px) {
  .portfolio-manager table {
    font-size: 0.75rem;
  }
  
  .portfolio-manager td {
    padding: 0.75rem 0.25rem;
  }
}
</style> 