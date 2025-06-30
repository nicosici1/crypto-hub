<template>
  <div class="min-h-screen bg-[#161b22] text-white flex flex-col md:flex-row">
    <!-- Panel lateral izquierdo -->
    <aside class="w-full md:w-64 bg-[#161b22] flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
      <!-- Header del panel -->
      <div class="p-4">
        <h2 class="text-base font-medium text-white flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
          </svg>
          Mis portafolios
        </h2>
      </div>
      <!-- Lista de carteras -->
      <div class="flex-1 p-3 space-y-1 min-w-[220px]">
        <div 
          v-for="cartera in carteras" 
          :key="cartera.id"
          @click="seleccionarCartera(cartera)"
          :class="[
            'group p-3 rounded-lg cursor-pointer transition-all duration-200 border',
            carteraActiva?.id === cartera.id 
              ? 'bg-blue-500/10 border-blue-500/30' 
              : 'hover:bg-gray-800/20 border-transparent hover:border-gray-700/30'
          ]"
        >
          <div class="flex items-center gap-2">
            <div :class="[
              'w-6 h-6 mr-2 rounded-full flex items-center justify-center text-white font-bold text-[10px]',
              getCarteraGradient(cartera.id)
            ]">
              {{ (cartera.name || cartera.nombre || 'C').charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 group">
                  <span class="font-medium text-white text-sm truncate">{{ cartera.name || cartera.nombre || 'Sin nombre' }}</span>
                  <button 
                    @click.stop="editarNombreCartera(cartera)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-400 p-1"
                    title="Editar nombre"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <span v-if="cartera.esDefault || cartera.is_default" class="bg-blue-500/20 text-blue-400 text-xs px-1.5 py-0.5 rounded border border-blue-500/30">
                  Default
                </span>
              </div>
              <div class="flex items-center gap-1 mt-0.5">
                <div class="text-sm font-medium text-gray-300">
                  {{ formatCurrency(getCarteraValue(cartera.id)) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Botón crear cartera como texto -->
        <div class="pt-4">
          <button
            @click="showModalCartera = true"
            class="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium px-0 py-0 bg-transparent shadow-none rounded-none"
            style="background: none; box-shadow: none;"
          >
            <span class="text-lg">+</span> Crear cartera
          </button>
        </div>
      </div>
    </aside>
    <!-- Contenido principal -->
    <div class="flex-1 flex flex-col bg-[#161b22] min-w-0">
      <!-- Header del Portfolio -->
      <div class="p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-sm">{{ (carteraActiva?.name || carteraActiva?.nombre || 'M').charAt(0).toUpperCase() }}</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-white text-xl font-semibold">{{ carteraActiva?.name || carteraActiva?.nombre || 'Mi Portfolio Principal' }}</h1>
                <span v-if="carteraActiva?.esDefault || carteraActiva?.is_default" class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">Default</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-gray-400 text-sm">Mostrar métricas</span>
              <label class="switch">
                <input type="checkbox" v-model="showCharts">
                <span class="slider round"></span>
              </label>
            </div>
            <button 
              @click="abrirModalTransaccion"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
              </svg>
              Agregar transacción
            </button>
          </div>
        </div>
        <!-- Portfolio Value -->
        <div class="mb-6">
          <div class="flex items-center gap-2 mb-1">
            <h2 class="text-4xl font-bold text-white">{{ showValue ? formatCurrency(metrica.valorTotal) : '••••••' }}</h2>
            <button @click="toggleValueVisibility" class="text-gray-400 hover:text-white">
              <svg v-if="showValue" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/>
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
              </svg>
            </button>
          </div>
          <div :class="[
            'flex items-center gap-1 text-base font-medium',
            beneficio24h >= 0 ? 'text-emerald-400' : 'text-red-400'
          ]">
            <svg class="w-4 h-4" :class="beneficio24h >= 0 ? 'rotate-0' : 'rotate-180'" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <span>{{ beneficio24h >= 0 ? '+' : '' }}{{ formatCurrency(beneficio24h) }}</span>
            <span class="text-gray-400">•</span>
            <span>{{ formatPercentage(beneficioPorcentaje24h) }} (24h)</span>
          </div>
        </div>
        <!-- Pestañas -->
        <div class="flex flex-col sm:flex-row border-gray-800">
          <button 
            :class="[
              'px-4 py-3 font-medium text-sm transition-colors border-b-2',
              activeTab === 'overview' 
                ? 'text-blue-400 border-blue-400' 
                : 'text-gray-400 hover:text-white border-transparent'
            ]"
            @click="activeTab = 'overview'"
          >
            Vista general
          </button>
          <button 
            :class="[
              'px-4 py-3 font-medium text-sm transition-colors border-b-2',
              activeTab === 'transactions' 
                ? 'text-blue-400 border-blue-400' 
                : 'text-gray-400 hover:text-white border-transparent'
            ]"
            @click="activeTab = 'transactions'"
          >
            Transacciones
          </button>
        </div>
      </div>
      <!-- Contenido de las pestañas -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6">
        <div v-if="activeTab === 'overview'">
          <!-- Métricas generales -->
          <div v-if="showCharts" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="bg-gray-800/50 rounded-xl p-4">
              <div class="text-gray-400 text-sm mb-1 flex items-center gap-1">
                Beneficio histórico
                <span class="relative group cursor-pointer">
                  <svg class="w-4 h-4 text-gray-400 hover:text-blue-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor">?</text>
                  </svg>
                  <span class="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-gray-900 text-xs text-white rounded shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                    Ganancia o pérdida total desde que comenzaste a invertir en este portfolio.
                  </span>
                </span>
              </div>
              <div class="text-white text-xl font-bold">{{ beneficioTotal >= 0 ? '+' : '' }}{{ formatCurrency(beneficioTotal) }}</div>
              <div :class="[
                'text-sm font-medium',
                beneficioTotal >= 0 ? 'text-emerald-400' : 'text-red-400'
              ]">
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3" :class="beneficioTotal >= 0 ? 'rotate-0' : 'rotate-180'" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  {{ formatPercentage(beneficioPorcentajeTotal) }}
                </span>
              </div>
            </div>
            <div class="bg-gray-800/50 rounded-xl p-4">
              <div class="text-gray-400 text-sm mb-1 flex items-center gap-1">
                Costo de adquisición
                <span class="relative group cursor-pointer">
                  <svg class="w-4 h-4 text-gray-400 hover:text-blue-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor">?</text>
                  </svg>
                  <span class="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-gray-900 text-xs text-white rounded shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                    Suma total invertida en compras de criptomonedas en este portfolio.
                  </span>
                </span>
              </div>
              <div class="text-white text-xl font-bold">{{ formatCurrency(metrica.inversionTotal) }}</div>
            </div>
            <div class="bg-gray-800/50 rounded-xl p-4">
              <div class="text-gray-400 text-sm mb-1 flex items-center gap-1">
                Mejor rendimiento
                <span class="relative group cursor-pointer">
                  <svg class="w-4 h-4 text-gray-400 hover:text-blue-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor">?</text>
                  </svg>
                  <span class="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-gray-900 text-xs text-white rounded shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                    Criptomoneda con mayor ganancia porcentual en tu portfolio.
                  </span>
                </span>
              </div>
              <div v-if="metrica.mejorActivo" class="text-emerald-400 text-sm font-medium">
                <div class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  +{{ formatPercentage(metrica.mejorActivo.gananciaPorcentaje) }}
                  <span class="ml-2">({{ formatCurrency(metrica.mejorActivo.gananciaTotal) }})</span>
                </div>
              </div>
              <div v-else class="text-gray-400 text-sm">Sin datos</div>
            </div>
            <div class="bg-gray-800/50 rounded-xl p-4">
              <div class="text-gray-400 text-sm mb-1 flex items-center gap-1">
                Peor rendimiento
                <span class="relative group cursor-pointer">
                  <svg class="w-4 h-4 text-gray-400 hover:text-blue-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor">?</text>
                  </svg>
                  <span class="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-gray-900 text-xs text-white rounded shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                    Criptomoneda con mayor pérdida porcentual en tu portfolio.
                  </span>
                </span>
              </div>
              <div v-if="metrica.peorActivo" class="text-red-400 text-sm font-medium">
                <div class="flex items-center gap-1">
                  <svg class="w-3 h-3 rotate-180" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  -{{ formatPercentage(Math.abs(metrica.peorActivo.gananciaPorcentaje)) }}
                  <span class="ml-2">({{ formatCurrency(metrica.peorActivo.gananciaTotal) }})</span>
                </div>
              </div>
              <div v-else class="text-gray-400 text-sm">Sin datos</div>
            </div>
          </div>
          <!-- Lista de activos -->
          <PortfolioManager
            :activos="activos"
            :cartera-filtro="carteraActiva?.id"
            @add-transaction="abrirModalTransaccion"
            @portfolio-updated="refrescarPortfolio"
          />
        </div>
        <div v-else-if="activeTab === 'transactions'">
          <div class="max-w-3xl mx-auto">
            <h3 class="text-white text-lg font-semibold mb-4 text-center">Historial de transacciones</h3>
            <div v-if="transacciones && transacciones.length === 0" class="text-center py-8">
              <p class="text-gray-400">No hay transacciones en este portfolio</p>
            </div>
            <div v-else class="space-y-4">
              <div v-for="tx in transacciones" :key="tx.id" class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                <div class="flex items-center gap-3">
                  <img v-if="tx.coin_image" :src="tx.coin_image" :alt="tx.coin_name" class="w-8 h-8 rounded-full bg-white shadow" />
                  <div v-else :class="['w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs', getCarteraGradient(tx.coin_id)]">
                    {{ tx.coin_symbol?.charAt(0).toUpperCase() || '?' }}
                  </div>
                  <div>
                    <div class="text-white font-medium">
                      {{ tx.type === 'buy' ? 'Compra' : tx.type === 'sell' ? 'Venta' : 'Transacción' }}
                      de
                      <span v-if="tx.coin_name">{{ tx.coin_name }}</span>
                      <span v-else class="text-gray-400">Cripto desconocida</span>
                      <span v-if="tx.coin_symbol" class="text-gray-400">({{ tx.coin_symbol.toUpperCase() }})</span>
                    </div>
                    <div class="text-gray-400 text-sm">
                      {{ formatNumber(tx.amount) }} {{ tx.coin_symbol?.toUpperCase() || '' }}
                      <span v-if="tx.price">a {{ formatCurrency(tx.price) }} c/u</span>
                    </div>
                    <div class="text-gray-400 text-sm">{{ formatDate(tx.date) }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div :class="['font-medium', tx.type === 'buy' ? 'text-emerald-400' : tx.type === 'sell' ? 'text-red-400' : 'text-gray-400']">
                    {{ tx.type === 'buy' ? '+' : tx.type === 'sell' ? '-' : '' }}{{ formatCurrency(tx.amount * tx.price) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalTransaccion
        v-if="showModal"
        :cartera-activa="carteraActiva"
        :cripto-seleccionada="activoSeleccionado"
        @close="showModal = false; activoSeleccionado = null"
        @transaction-saved="refrescarPortfolio"
      />
      <ModalCartera
        v-if="showModalCartera"
        :edit-mode="!!carteraAEditar"
        :cartera="carteraAEditar"
        @close="cerrarModalCartera"
        @saved="onCarteraGuardada"
      />
    </div>
  </div>
</template>

<script>
import PortfolioManager from '../components/PortfolioManager.vue';
import ModalTransaccion from '../components/ModalTransaccion.vue';
import ModalCartera from '../components/ModalCartera.vue';
import { TransactionService } from '../services/transactions';
import { getBackendPrices } from '../services/api';

const API_URL = process.env.VUE_APP_API_URL;

export default {
  name: 'PortfolioView',
  components: { PortfolioManager, ModalTransaccion, ModalCartera },
  data() {
    return {
      carteras: [],
      carteraActiva: null,
      carteraAEditar: null,
      activos: [],
      metrica: {
        valorTotal: 0,
        inversionTotal: 0,
        gananciaTotal: 0,
        mejorActivo: null,
        peorActivo: null
      },
      loading: true,
      showModal: false,
      showModalCartera: false,
      transacciones: [],
      showValue: true,
      showCharts: true,
      activeTab: 'overview',
      beneficioTotal: 0,
      beneficioPorcentajeTotal: 0,
      beneficio24h: 0,
      beneficioPorcentaje24h: 0,
      activoSeleccionado: null,
      carteraValores: {}
    };
  },
  methods: {
    async cargarCarterasYPortfolio() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autorizado');

        // Obtener carteras del usuario
        const response = await fetch(`${API_URL}/portfolios`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const portfoliosData = await response.json();
        this.carteras = portfoliosData;
        this.carteraActiva = this.carteras.find(c => c.is_default) || this.carteras[0];
        // Calcular valor de todas las carteras
        await this.calcularValoresCarteras();
        await this.cargarPortfolio();
      } catch (e) {
        console.error('Error al cargar carteras:', e);
      } finally {
        this.loading = false;
      }
    },
    async calcularValoresCarteras() {
      // Calcula el valor total de cada cartera y lo guarda en carteraValores
      const token = localStorage.getItem('token');
      if (!token) return;
      const valores = {};
      for (const cartera of this.carteras) {
        try {
          // Obtener transacciones de la cartera
          const res = await fetch(`${API_URL}/transactions/portfolio/${cartera.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const transacciones = await res.json();
          // Agrupar y calcular activos
          const activosMap = {};
          for (const tx of transacciones) {
            if (!activosMap[tx.coin_id]) {
              activosMap[tx.coin_id] = {
                coin_id: tx.coin_id,
                totalAmount: 0,
                totalInvested: 0,
                buys: []
              };
            }
            if (tx.type === 'buy') {
              activosMap[tx.coin_id].totalAmount += Number(tx.amount);
              activosMap[tx.coin_id].totalInvested += Number(tx.amount) * Number(tx.price) + Number(tx.fee || 0);
              activosMap[tx.coin_id].buys.push(tx);
            } else if (tx.type === 'sell') {
              activosMap[tx.coin_id].totalAmount -= Number(tx.amount);
            }
          }
          const activosUsuario = Object.values(activosMap).filter(a => a.totalAmount > 0);
          let valorTotal = 0;
          if (activosUsuario.length > 0) {
            // Obtener precios actuales
            const precios = await getBackendPrices(activosUsuario.map(a => a.coin_id));
            for (const activo of activosUsuario) {
              const precio = precios.find(p => p.id === activo.coin_id);
              if (precio && precio.current_price) {
                valorTotal += activo.totalAmount * precio.current_price;
              }
            }
          }
          valores[cartera.id] = valorTotal;
        } catch (e) {
          valores[cartera.id] = 0;
        }
      }
      this.carteraValores = valores;
    },
    getCarteraValue(id) {
      // Devuelve el valor calculado para cada cartera
      return this.carteraValores[id] ?? 0;
    },
    async seleccionarCartera(cartera) {
      this.carteraActiva = cartera;
      await this.cargarPortfolio();
    },
    getCarteraGradient(id) {
      const gradientes = [
        'bg-gradient-to-r from-emerald-500 to-teal-600',
        'bg-gradient-to-r from-blue-500 to-purple-600',
        'bg-gradient-to-r from-purple-500 to-pink-500',
        'bg-gradient-to-r from-pink-500 to-red-500',
        'bg-gradient-to-r from-yellow-500 to-orange-500',
        'bg-gradient-to-r from-indigo-500 to-purple-600',
        'bg-gradient-to-r from-green-500 to-lime-500',
        'bg-gradient-to-r from-cyan-500 to-blue-500',
        'bg-gradient-to-r from-rose-500 to-pink-500',
        'bg-gradient-to-r from-amber-500 to-yellow-500',
        'bg-gradient-to-r from-violet-500 to-purple-500',
        'bg-gradient-to-r from-slate-500 to-gray-600'
      ];
      return gradientes[id % gradientes.length];
    },
    async cargarPortfolio() {
      this.loading = true;
      try {
        // Obtener transacciones del portfolio activo
        this.transacciones = await TransactionService.getTransactionsByPortfolio(this.carteraActiva.id);
        // Agrupar transacciones por coin_id
        const activosMap = {};
        for (const tx of this.transacciones) {
          if (!activosMap[tx.coin_id]) {
            activosMap[tx.coin_id] = {
              coin_id: tx.coin_id,
              coin_name: tx.coin_name,
              coin_symbol: tx.coin_symbol,
              coin_image: tx.coin_image,
              totalAmount: 0,
              totalInvested: 0,
              totalSold: 0,
              averagePrice: 0,
              buys: [],
              sells: []
            };
          }
          if (tx.type === 'buy') {
            activosMap[tx.coin_id].totalAmount += Number(tx.amount);
            activosMap[tx.coin_id].totalInvested += Number(tx.amount) * Number(tx.price) + Number(tx.fee || 0);
            activosMap[tx.coin_id].buys.push(tx);
          } else if (tx.type === 'sell') {
            activosMap[tx.coin_id].totalAmount -= Number(tx.amount);
            activosMap[tx.coin_id].totalSold += Number(tx.amount) * Number(tx.price) - Number(tx.fee || 0);
            activosMap[tx.coin_id].sells.push(tx);
          }
        }
        // Calcular precio promedio de compra solo sobre las compras
        for (const key in activosMap) {
          const a = activosMap[key];
          const totalComprado = a.buys.reduce((sum, tx) => sum + Number(tx.amount), 0);
          const totalInvertido = a.buys.reduce((sum, tx) => sum + Number(tx.amount) * Number(tx.price) + Number(tx.fee || 0), 0);
          a.averagePrice = totalComprado > 0 ? totalInvertido / totalComprado : 0;
        }
        // Filtrar solo activos con cantidad positiva
        const activosUsuario = Object.values(activosMap).filter(a => a.totalAmount > 0);
        // Obtener precios actuales solo de las monedas del usuario
        const coinIds = activosUsuario.map(a => a.coin_id).join(',');
        let precios = [];
        if (coinIds) {
          precios = await getBackendPrices(activosUsuario.map(a => a.coin_id));
        }
        console.log('DEBUG precios CoinGecko:', precios);
        // Unir datos de precios a los activos y calcular métricas por activo
        this.activos = activosUsuario.map(activo => {
          const precio = precios.find(p => p.id === activo.coin_id);
          const current_price = precio?.current_price;
          // Si no hay precio, no calculamos métricas
          if (!current_price || isNaN(current_price)) {
            return {
              ...activo,
              current_price: null,
              price_change_percentage_1h: null,
              price_change_percentage_24h: null,
              price_change_percentage_7d: null,
              image: precio?.image || activo.coin_image,
              name: precio?.name || activo.coin_name,
              symbol: precio?.symbol || activo.coin_symbol,
              valorActual: null,
              ganancia: null,
              gananciaPorcentaje: null
            };
          }
          const valorActual = activo.totalAmount * current_price;
          const ganancia = valorActual - activo.totalInvested;
          const gananciaPorcentaje = activo.totalInvested > 0 ? (ganancia / activo.totalInvested) * 100 : null;
          return {
            ...activo,
            current_price,
            price_change_percentage_1h: precio?.price_change_percentage_1h_in_currency ?? null,
            price_change_percentage_24h: precio?.price_change_percentage_24h_in_currency ?? null,
            price_change_percentage_7d: precio?.price_change_percentage_7d_in_currency ?? null,
            image: precio?.image || activo.coin_image,
            name: precio?.name || activo.coin_name,
            symbol: precio?.symbol || activo.coin_symbol,
            valorActual,
            ganancia,
            gananciaPorcentaje
          };
        });
        console.log('DEBUG activos procesados:', this.activos);
        // Calcular métricas generales
        this.metrica = this.calcularMetricas(this.activos);
        // Calcular métricas adicionales para el header
        this.beneficioTotal = this.metrica.gananciaTotal;
        this.beneficioPorcentajeTotal = this.metrica.inversionTotal > 0 ? (this.metrica.gananciaTotal / this.metrica.inversionTotal) * 100 : 0;
        // Calcular beneficio 24h
        let beneficio24h = 0;
        for (const a of this.activos) {
          if (!a.current_price || !a.price_change_percentage_24h) continue;
          const precioAyer = a.current_price / (1 + (a.price_change_percentage_24h / 100));
          beneficio24h += a.totalAmount * (a.current_price - precioAyer);
        }
        this.beneficio24h = beneficio24h;
        this.beneficioPorcentaje24h = this.metrica.valorTotal > 0 ? (beneficio24h / this.metrica.valorTotal) * 100 : 0;
      } catch (e) {
        console.error('Error al cargar portfolio:', e);
      } finally {
        this.loading = false;
      }
    },
    calcularMetricas(activos) {
      let valorTotal = 0, inversionTotal = 0, gananciaTotal = 0;
      let mejorActivo = null, peorActivo = null;
      for (const a of activos) {
        if (!a.valorActual || !a.ganancia || a.gananciaPorcentaje === null) continue;
        valorTotal += a.valorActual;
        inversionTotal += a.totalInvested;
        gananciaTotal += a.ganancia;
        if (!mejorActivo || a.gananciaPorcentaje > mejorActivo.gananciaPorcentaje) mejorActivo = a;
        if (!peorActivo || a.gananciaPorcentaje < peorActivo.gananciaPorcentaje) peorActivo = a;
      }
      return {
        valorTotal,
        inversionTotal,
        gananciaTotal,
        mejorActivo,
        peorActivo
      };
    },
    formatCurrency(val) {
      if (val === null || val === undefined || isNaN(val)) return '-';
      return val ? val.toLocaleString('es-ES', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }) : '$0';
    },
    formatPercentage(val) {
      if (val === null || val === undefined || isNaN(val)) return '-';
      return (val ? val.toFixed(2) : '0.00') + '%';
    },
    formatNumber(val) {
      if (val === null || val === undefined || isNaN(val)) return '-';
      return val.toLocaleString('es-ES', { maximumFractionDigits: 8 });
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    toggleValueVisibility() {
      this.showValue = !this.showValue;
    },
    refrescarPortfolio() {
      this.cargarPortfolio();
    },
    abrirModalTransaccion() {
      this.activoSeleccionado = null;
      this.showModal = true;
    },
    cerrarModalCartera() {
      this.showModalCartera = false;
      this.carteraAEditar = null;
    },
    async onCarteraGuardada() {
      await this.cargarCarterasYPortfolio();
    },
    editarNombreCartera(cartera) {
      this.carteraAEditar = { ...cartera };
      this.showModalCartera = true;
    }
  },
  mounted() {
    this.cargarCarterasYPortfolio();
  }
};
</script>