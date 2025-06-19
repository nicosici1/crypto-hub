<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div class="bg-[#23242a] rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
      <button class="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" @click="$emit('close')">&times;</button>
      <div v-if="step === 1">
        <h2 class="text-xl font-bold text-white mb-4">Seleccionar moneda</h2>
        <input v-model="search" type="text" placeholder="Buscar" class="w-full mb-4 p-2 rounded bg-[#181c23] text-white" />
        <ul class="space-y-2 max-h-72 overflow-y-auto">
          <li v-for="coin in filteredCoins" :key="coin.id" class="flex items-center gap-3 p-2 rounded hover:bg-[#181c23] cursor-pointer" @click="selectCoin(coin)">
            <img :src="coin.image" :alt="coin.name" class="w-7 h-7 rounded-full" />
            <span class="font-bold text-white">{{ coin.name }}</span>
            <span class="uppercase text-xs text-gray-400">{{ coin.symbol }}</span>
          </li>
        </ul>
      </div>
      <div v-else-if="step === 2">
        <h2 class="text-xl font-bold text-white mb-4">Agregar transacción</h2>
        <div class="flex items-center gap-2 mb-4">
          <img :src="selectedCoin.image" :alt="selectedCoin.name" class="w-7 h-7 rounded-full" />
          <span class="font-bold text-white">{{ selectedCoin.name }}</span>
          <span class="uppercase text-xs text-gray-400">{{ selectedCoin.symbol }}</span>
        </div>
        <form @submit.prevent="saveTransaction">
          <div class="flex gap-2 mb-3">
            <button type="button" :class="['flex-1 px-2 py-1 rounded font-bold', type==='buy' ? 'bg-[#16c784] text-white' : 'bg-[#181c23] text-gray-300']" @click="type='buy'">Comprar</button>
            <button type="button" :class="['flex-1 px-2 py-1 rounded font-bold', type==='sell' ? 'bg-red-500 text-white' : 'bg-[#181c23] text-gray-300']" @click="type='sell'">Vender</button>
          </div>
          <div class="mb-3">
            <label class="block text-gray-300 mb-1">Cantidad</label>
            <input v-model.number="amount" type="number" min="0" step="any" class="w-full rounded p-2 bg-[#181c23] text-white" placeholder="0.00" required />
          </div>
          <div class="mb-3">
            <label class="block text-gray-300 mb-1">Precio por moneda</label>
            <input v-model.number="price" type="number" min="0" step="any" class="w-full rounded p-2 bg-[#181c23] text-white" required />
          </div>
          <div class="mb-3">
            <label class="block text-gray-300 mb-1">Fecha y hora</label>
            <input v-model="date" type="datetime-local" class="w-full rounded p-2 bg-[#181c23] text-white" required />
          </div>
          <div class="mb-3">
            <label class="block text-gray-300 mb-1">Tarifa (opcional)</label>
            <input v-model.number="fee" type="number" min="0" step="any" class="w-full rounded p-2 bg-[#181c23] text-white" placeholder="0.00" />
          </div>
          <div class="mb-3">
            <label class="block text-gray-300 mb-1">Notas (opcional)</label>
            <textarea v-model="notes" class="w-full rounded p-2 bg-[#181c23] text-white" rows="2" placeholder="Notas"></textarea>
          </div>
          <div class="mb-4 text-white font-bold text-lg">
            Total: ${{ formatNumber(total) }}
          </div>
          <button type="submit" class="mt-2 bg-[#16c784] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#13a06b] transition w-full">Agregar transacción</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { TransactionService } from '../services/transactions';
import dayjs from 'dayjs';

export default {
  name: 'ModalTransaccion',
  props: {
    editTx: {
      type: Object,
      default: null
    },
    carteraActiva: {
      type: Object,
      default: () => ({ id: 1 })
    },
    usuarioActivo: {
      type: Object,
      default: null
    },
    criptoSeleccionada: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      step: 1,
      search: '',
      coins: [],
      selectedCoin: null,
      amount: '',
      price: '',
      type: 'buy',
      date: '',
      fee: '',
      notes: '',
      user: null,
      priceCache: {},
      lastApiCall: 0,
      apiCallDelay: 6000,
      error: null,
      loading: false
    }
  },
  computed: {
    filteredCoins() {
      if (!this.search) return this.coins;
      const s = this.search.toLowerCase();
      return this.coins.filter(c => c.name.toLowerCase().includes(s) || c.symbol.toLowerCase().includes(s));
    },
    total() {
      // Total gastado o recibido (sin tarifa)
      return (this.amount && this.price) ? this.amount * this.price : 0;
    }
  },
  methods: {
    loadUser() {
      const savedUser = localStorage.getItem('crypto-current-user');
      if (savedUser) {
        try {
          this.user = JSON.parse(savedUser);
        } catch (error) {
          console.error('Error al cargar usuario:', error);
          this.user = null;
        }
      }
    },
    openModal() {
      // Resetear el estado al abrir el modal
      this.step = 1;
      this.selectedCoin = null;
      this.amount = '';
      this.price = '';
      this.type = 'buy';
      this.date = '';
      this.fee = '';
      this.notes = '';
      this.error = null;
      this.fetchCoins();
    },
    async fetchCoins() {
      try {
        // Pide las top 100 monedas al backend
        const res = await fetch('http://localhost:3000/api/prices');
        const data = await res.json();
        this.coins = data;
        // Si hay una cripto seleccionada, seleccionarla automáticamente
        if (this.criptoSeleccionada && (this.criptoSeleccionada.id || this.criptoSeleccionada.coin_id)) {
          let selected = this.coins.find(c => c.id === (this.criptoSeleccionada.id || this.criptoSeleccionada.coin_id) || c.symbol === (this.criptoSeleccionada.symbol || this.criptoSeleccionada.coin_symbol));
          if (!selected) {
            selected = {
              id: this.criptoSeleccionada.id || this.criptoSeleccionada.coin_id,
              name: this.criptoSeleccionada.name || this.criptoSeleccionada.coin_name,
              symbol: this.criptoSeleccionada.symbol || this.criptoSeleccionada.coin_symbol,
              image: this.criptoSeleccionada.image || this.criptoSeleccionada.coin_image,
              current_price: this.criptoSeleccionada.current_price || this.criptoSeleccionada.price || 0
            };
          }
          this.selectedCoin = selected;
          this.price = selected.current_price;
          this.date = new Date().toISOString().slice(0,16);
          this.step = 2;
        }
      } catch (error) {
        console.error('ModalTransaccion - Error al obtener monedas:', error);
        this.error = 'Error al cargar las criptomonedas. Por favor, intente nuevamente.';
      }
    },
    selectCoin(coin) {
      this.selectedCoin = coin;
      this.price = coin.current_price;
      this.date = new Date().toISOString().slice(0,16);
      this.step = 2;
    },
    formatNumber(val) {
      if (!val && val !== 0) return '-';
      return val.toLocaleString('es-ES', { maximumFractionDigits: 8 });
    },
    async saveTransaction() {
      try {
        if (!this.selectedCoin) {
          this.error = 'Por favor selecciona una criptomoneda';
          return;
        }

        if (!this.amount || this.amount <= 0) {
          this.error = 'Por favor ingresa una cantidad válida';
          return;
        }

        if (!this.price || this.price <= 0) {
          this.error = 'Por favor ingresa un precio válido';
          return;
        }

        // Obtener usuario y cartera activa (ajusta según tu store/contexto)
        const usuarioActivo = JSON.parse(localStorage.getItem('crypto-current-user')) || {};
        const carteraActiva = this.carteraActiva || {};
        // Formatear la fecha al formato correcto para MySQL
        const transactionDate = dayjs(this.date).format('YYYY-MM-DD HH:mm:ss');
        const transaction = {
          user_id: usuarioActivo.id || null,
          portfolio_id: carteraActiva.id || null,
          coin_id: this.selectedCoin?.id || null,
          coin_name: this.selectedCoin?.name || null,
          coin_symbol: this.selectedCoin?.symbol || null,
          coin_image: this.selectedCoin?.image || null,
          amount: this.amount ? Number(this.amount) : null,
          price: this.price ? Number(this.price) : null,
          type: this.type || null,
          date: transactionDate,
          fee: this.fee ? Number(this.fee) : 0,
          notes: this.notes || null,
          total: (this.amount && this.price) ? Number(this.amount) * Number(this.price) : null
        };

        console.log('Enviando transacción:', transaction); // Para debugging

        if (this.editTx) {
          await TransactionService.updateTransaction(this.editTx.id, transaction);
        } else {
          await TransactionService.addTransaction(transaction);
        }
        
        this.$emit('transaction-saved');
        this.$emit('close');
      } catch (error) {
        console.error('Error al guardar la transacción:', error);
        if (error.response?.data?.message) {
          this.error = error.response.data.message;
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'Error al guardar la transacción. Por favor, intenta de nuevo.';
        }
      }
    },
    closeModal() {
      this.$emit('close');
    }
  },
  watch: {
    editTx: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.selectedCoin = {
            id: newVal.coin_id,
            name: newVal.coin_name,
            symbol: newVal.coin_symbol
          };
          this.amount = newVal.amount.toString();
          this.price = newVal.price.toString();
          this.type = newVal.type;
          this.date = newVal.date;
          this.fee = newVal.fee ? newVal.fee.toString() : '';
          this.notes = newVal.notes || '';
          this.step = 2;
        }
      }
    }
  },
  mounted() {
    this.loadUser();
    this.openModal();
  }
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

/* Estilos para notificaciones */
:global(.animate-slide-in) {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { 
    transform: translateX(100%); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0); 
    opacity: 1; 
  }
}
</style> 