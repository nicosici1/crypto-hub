<template>
  <div class="profile-manager">
    <div v-if="!user" class="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#1a1c23] to-[#23242a] rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-[1.02]">
      <div v-if="!showRegister" class="w-full max-w-md space-y-6">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-2">Bienvenido de nuevo</h2>
          <p class="text-gray-400">Ingresa tus credenciales para continuar</p>
        </div>
        <div class="space-y-4">
          <div class="group">
            <label class="block text-gray-300 text-sm font-bold mb-2 group-hover:text-[#16c784] transition-colors duration-300" for="email">
              Email
            </label>
            <input
              v-model="email"
              class="w-full px-4 py-3 bg-[#161b22] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16c784] transition-all duration-300 placeholder-gray-500"
              type="email"
              id="email"
              placeholder="tu@email.com"
            />
          </div>
          <div class="group">
            <label class="block text-gray-300 text-sm font-bold mb-2 group-hover:text-[#16c784] transition-colors duration-300" for="password">
              Contraseña
            </label>
            <input
              v-model="password"
              class="w-full px-4 py-3 bg-[#161b22] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16c784] transition-all duration-300 placeholder-gray-500"
              type="password"
              id="password"
              placeholder="••••••••"
            />
          </div>
        </div>
        <button
          @click="login"
          class="w-full bg-gradient-to-r from-[#16c784] to-[#13a06b] text-white font-bold py-3 px-4 rounded-xl hover:from-[#13a06b] hover:to-[#16c784] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          Iniciar Sesión
        </button>
        <div class="text-center">
          <button
            @click="showRegister = true"
            class="text-[#16c784] hover:text-[#13a06b] transition-colors duration-300 font-medium"
          >
            ¿No tienes cuenta? <span class="underline">Regístrate</span>
          </button>
        </div>
      </div>

      <div v-else class="w-full max-w-md space-y-6">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-2">Crear Cuenta</h2>
          <p class="text-gray-400">Únete a nuestra comunidad crypto</p>
        </div>
        <div class="space-y-4">
          <div class="group">
            <label class="block text-gray-300 text-sm font-bold mb-2 group-hover:text-[#16c784] transition-colors duration-300" for="regName">
              Nombre
            </label>
            <input
              v-model="registerData.name"
              class="w-full px-4 py-3 bg-[#161b22] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16c784] transition-all duration-300 placeholder-gray-500"
              type="text"
              id="regName"
              placeholder="Tu nombre"
            />
          </div>
          <div class="group">
            <label class="block text-gray-300 text-sm font-bold mb-2 group-hover:text-[#16c784] transition-colors duration-300" for="regEmail">
              Email
            </label>
            <input
              v-model="registerData.email"
              class="w-full px-4 py-3 bg-[#161b22] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16c784] transition-all duration-300 placeholder-gray-500"
              type="email"
              id="regEmail"
              placeholder="tu@email.com"
            />
          </div>
          <div class="group">
            <label class="block text-gray-300 text-sm font-bold mb-2 group-hover:text-[#16c784] transition-colors duration-300" for="regPassword">
              Contraseña
            </label>
            <input
              v-model="registerData.password"
              class="w-full px-4 py-3 bg-[#161b22] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16c784] transition-all duration-300 placeholder-gray-500"
              type="password"
              id="regPassword"
              placeholder="••••••••"
            />
          </div>
        </div>
        <button
          @click="register"
          class="w-full bg-gradient-to-r from-[#16c784] to-[#13a06b] text-white font-bold py-3 px-4 rounded-xl hover:from-[#13a06b] hover:to-[#16c784] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          Registrarse
        </button>
        <div class="text-center">
          <button
            @click="showRegister = false"
            class="text-[#16c784] hover:text-[#13a06b] transition-colors duration-300 font-medium"
          >
            ¿Ya tienes cuenta? <span class="underline">Inicia sesión</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="bg-gradient-to-br from-[#1a1c23] to-[#23242a] rounded-2xl p-8 shadow-2xl">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div class="flex items-center gap-4">
          <div class="relative group">
            <div 
              :class="[
                'w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white cursor-pointer transition-all duration-300 hover:scale-105',
                user?.avatar_type === 'emoji' ? 'bg-gradient-to-r from-[#16c784] to-[#13a06b]' : 
                user?.avatar_type === 'image' ? '' : 
                'bg-gradient-to-r from-[#16c784] to-[#13a06b]'
              ]"
              :style="user?.avatar_type === 'initials' && user?.avatar_color ? { background: user.avatar_color } : {}"
              @click="showAvatarModal = true"
            >
              <img 
                v-if="user?.avatar_type === 'image' && user?.avatar_url" 
                :src="user.avatar_url" 
                :alt="user?.name || 'Avatar'"
                class="w-full h-full rounded-full object-cover"
              />
              <span v-else-if="user?.avatar_type === 'emoji' && user?.avatar_emoji">
                {{ user.avatar_emoji }}
              </span>
              <span v-else>
                {{ user?.name?.charAt(0)?.toUpperCase() || '?' }}
              </span>
            </div>
            <div class="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 class="text-3xl font-bold text-white mb-1">{{ user?.name || 'Usuario' }}</h2>
            <p class="text-gray-400">{{ user?.email || 'No hay email' }}</p>
          </div>
        </div>
        <button
          @click="logout"
          class="ml-1 px-3 py-2 rounded-full hover:bg-[#23242a] transition flex items-center gap-2 text-gray-400 hover:text-red-400"
          style="line-height: 1; font-weight: 500; font-size: 1rem;"
          title="Cerrar sesión"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-[#161b22] rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white">Mis Carteras</h3>
            <span class="text-[#16c784] text-2xl font-bold">{{ userPortfolios.length }}</span>
          </div>
          <p class="text-gray-400">Carteras activas</p>
        </div>
        <div class="bg-[#161b22] rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white">Transacciones</h3>
            <span class="text-[#16c784] text-2xl font-bold">{{ totalTransactions }}</span>
          </div>
          <p class="text-gray-400">Transacciones totales</p>
        </div>
        <div class="bg-[#161b22] rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white">Activos</h3>
            <span class="text-[#16c784] text-2xl font-bold">{{ uniqueAssets }}</span>
          </div>
          <p class="text-gray-400">Criptomonedas únicas</p>
        </div>
      </div>

      <div class="mb-8">
        <h3 class="text-xl font-bold text-white mb-4">Mis Carteras</h3>
        <div v-if="userPortfolios.length === 0" class="text-gray-400">No tienes carteras.</div>
        <div v-else-if="Object.keys(carteraValores).length === 0" class="text-red-400">No se pudieron calcular los valores.</div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="portfolio in userPortfolios" :key="portfolio.id" 
               class="bg-[#161b22] rounded-xl p-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <div class="flex items-center gap-3 mb-3">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm',
                getPortfolioGradient(portfolio.id)
              ]">
                {{ portfolio?.name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <div>
                <h4 class="text-white font-medium">{{ portfolio?.name || 'Sin nombre' }}</h4>
                <p class="text-gray-400 text-sm">{{ getTransaccionesPorCartera(portfolio.id) }} transacciones</p>
              </div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">Valor total</span>
              <span class="text-white font-medium">{{ formatCurrency(getCarteraValue(portfolio.id)) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-xl font-bold text-white mb-4">Actividad Reciente</h3>
        <div class="bg-[#161b22] rounded-xl p-4">
          <div v-if="recentTransactions.length === 0" class="text-center py-8">
            <p class="text-gray-400">No hay actividad reciente</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="tx in recentTransactions" :key="tx.id" 
                 class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
              <div class="flex items-center gap-3">
                <img v-if="tx?.coin?.image" :src="tx.coin.image" :alt="tx.coin.name" class="w-8 h-8 rounded-full bg-white shadow" />
                <div v-else :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs',
                  getCryptoColor(tx && tx.coin && tx.coin.symbol ? tx.coin.symbol : '')
                ]">
                  {{ tx && tx.coin && tx.coin.symbol ? tx.coin.symbol.charAt(0).toUpperCase() : '?' }}
                </div>
                <div>
                  <div class="text-white font-medium">
                    {{ tx?.type === 'buy' ? 'Compra' : tx?.type === 'sell' ? 'Venta' : 'Transacción' }}
                    de
                    <span v-if="tx?.coin && tx?.coin?.name">{{ tx.coin.name }}</span>
                    <span v-else class="text-gray-400">Cripto desconocida</span>
                    <span v-if="tx?.coin && tx?.coin?.symbol" class="text-gray-400">({{ tx.coin.symbol.toUpperCase() }})</span>
                  </div>
                  <div class="text-gray-400 text-sm">
                    {{ formatNumber(tx?.amount) }} {{ tx?.coin?.symbol?.toUpperCase() || '' }}
                    <span v-if="tx?.price">a {{ formatCurrency(tx.price) }} c/u</span>
                  </div>
                  <div class="text-gray-400 text-sm">{{ formatDate(tx?.date) }}</div>
                </div>
              </div>
              <div class="text-right">
                <div :class="[
                  'font-medium',
                  tx?.type === 'buy' ? 'text-emerald-400' : tx?.type === 'sell' ? 'text-red-400' : 'text-gray-400'
                ]">
                  {{ tx?.type === 'buy' ? '+' : tx?.type === 'sell' ? '-' : '' }}{{ formatCurrency(tx?.amount * tx?.price) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div v-if="showAvatarModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div class="bg-[#23242a] rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">

        <button 
          @click="showAvatarModal = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>

        <h2 class="text-xl font-bold text-white mb-6">Personalizar Avatar</h2>

        <div class="flex justify-center mb-6">
          <div 
            :class="[
              'w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white',
              selectedAvatarType === 'emoji' ? 'bg-gradient-to-r from-[#16c784] to-[#13a06b]' : 
              selectedAvatarType === 'image' ? '' : 
              'bg-gradient-to-r from-[#16c784] to-[#13a06b]'
            ]"
            :style="selectedAvatarType === 'initials' && selectedAvatarColor ? { background: selectedAvatarColor } : {}"
          >
            <img 
              v-if="selectedAvatarType === 'image' && selectedImageUrl" 
              :src="selectedImageUrl" 
              :alt="user?.name || 'Avatar'"
              class="w-full h-full rounded-full object-cover"
            />
            <span v-else-if="selectedAvatarType === 'emoji' && selectedEmoji">
              {{ selectedEmoji }}
            </span>
            <span v-else>
              {{ user?.name?.charAt(0)?.toUpperCase() || '?' }}
            </span>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <h3 class="text-white font-medium mb-3">Iniciales con colores</h3>
            <div class="grid grid-cols-6 gap-2">
              <button 
                v-for="color in avatarColors" 
                :key="color"
                @click="selectInitialsColor(color)"
                :class="[
                  'w-8 h-8 rounded-full border-2 transition-all',
                  selectedAvatarType === 'initials' && selectedAvatarColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                ]"
                :style="{ background: color }"
              ></button>
            </div>
          </div>

          <div>
            <h3 class="text-white font-medium mb-3">Emojis</h3>
            <div class="grid grid-cols-8 gap-2">
              <button 
                v-for="emoji in popularEmojis" 
                :key="emoji"
                @click="selectEmoji(emoji)"
                :class="[
                  'w-8 h-8 rounded-full border-2 transition-all text-lg hover:scale-110',
                  selectedAvatarType === 'emoji' && selectedEmoji === emoji ? 'border-white bg-blue-500/20' : 'border-transparent'
                ]"
              >
                {{ emoji }}
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-white font-medium mb-3">Imagen personalizada</h3>
            <div class="space-y-2">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="hidden"
              />
              <button
                @click="$refs.fileInput.click()"
                class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Seleccionar imagen
              </button>
              <p class="text-xs text-gray-400">Formatos: JPG, PNG, GIF. Máximo 5MB</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="showAvatarModal = false"
            class="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            @click="saveAvatar"
            class="px-4 py-2 rounded bg-blue-500 text-white font-bold hover:bg-blue-600"
            :disabled="savingAvatar"
          >
            <span v-if="savingAvatar" class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Guardando...
            </span>
            <span v-else>Guardar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getBackendPrices } from '../services/api';
export default {
  name: 'ProfileManager',
  data() {
    return {
      email: '',
      password: '',
      showRegister: false,
      registerData: {
        name: '',
        email: '',
        password: ''
      },
      user: null,
      userPortfolios: [],
      carteraValores: {},
      totalTransactions: 0,
      uniqueAssets: 0,
      recentTransactions: [],
      transaccionesPorCartera: {},
      showAvatarModal: false,
      selectedAvatarType: null,
      selectedAvatarColor: null,
      selectedEmoji: null,
      selectedImageUrl: null,
      avatarColors: [
        'linear-gradient(to right, #16c784, #13a06b)',
        'linear-gradient(to right, #3b82f6, #7c3aed)',
        'linear-gradient(to right, #8b5cf6, #ec4899)',
        'linear-gradient(to right, #ec4899, #ef4444)',
        'linear-gradient(to right, #eab308, #f97316)',
        'linear-gradient(to right, #6366f1, #7c3aed)',
        'linear-gradient(to right, #22c55e, #84cc16)',
        'linear-gradient(to right, #06b6d4, #3b82f6)',
        'linear-gradient(to right, #f43f5e, #ec4899)',
        'linear-gradient(to right, #f59e0b, #eab308)',
        'linear-gradient(to right, #8b5cf6, #a855f7)',
        'linear-gradient(to right, #64748b, #4b5563)'
      ],
      popularEmojis: ['🚀', '🌟', '💰', '💸', '💪', '🌍', '🌐', '💻', '🎯', '🔥', '⚡', '🎨', '🎭', '🎪', '🎯', '🎲'],
      savingAvatar: false
    }
  },
  computed: {
    isLoggedIn() {
      return !!this.user;
    }
  },
  methods: {
    async login() {
      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al iniciar sesión');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('crypto-current-user', JSON.stringify(data.user));
        this.user = data.user;

        const profileResponse = await fetch('http://localhost:3000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          this.user = profileData.user;
          localStorage.setItem('crypto-current-user', JSON.stringify(this.user));
          await this.loadUserData();
        }

        if (this.$root.$notify) {
          this.$root.$notify.success(data.message || '¡Bienvenido de vuelta!');
        }

        this.$emit('login-success', data.user);
      } catch (error) {
        if (this.$root.$notify) {
          this.$root.$notify.error(error.message || 'Error al iniciar sesión');
        } else {
          alert(error.message);
        }
      }
    },
    async register() {
      try {
        // Validar datos
        if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
          if (this.$root.$notify) {
            this.$root.$notify.error('Por favor completa todos los campos');
          } else {
            alert('Por favor completa todos los campos');
          }
          return;
        }

        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.registerData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al registrar usuario');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('crypto-current-user', JSON.stringify(data.user));
        this.user = data.user;
        this.showRegister = false;
        
        if (this.$root.$notify) {
          this.$root.$notify.success(data.message || '¡Cuenta creada exitosamente!');
        }
        
        this.$emit('login-success', data.user);
      } catch (error) {
        if (this.$root.$notify) {
          this.$root.$notify.error(error.message || 'Error al registrar usuario');
        } else {
          alert(error.message);
        }
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.user = null;
      
      if (this.$root.$notify) {
        this.$root.$notify.info('Has cerrado sesión correctamente');
      }
      
      this.$emit('logout');
    },
    getPortfolioGradient(id) {
      const gradients = [
        'bg-gradient-to-r from-emerald-500 to-teal-600',
        'bg-gradient-to-r from-blue-500 to-purple-600',
        'bg-gradient-to-r from-purple-500 to-pink-500',
        'bg-gradient-to-r from-pink-500 to-red-500',
        'bg-gradient-to-r from-yellow-500 to-orange-500'
      ];
      return gradients[id % gradients.length];
    },
    getCryptoColor(symbol) {
      if (!symbol || typeof symbol !== 'string') return 'bg-gradient-to-r from-gray-500 to-gray-600';
      const colors = {
        'btc': 'bg-gradient-to-r from-orange-500 to-yellow-500',
        'eth': 'bg-gradient-to-r from-blue-500 to-indigo-500',
        'bnb': 'bg-gradient-to-r from-yellow-500 to-orange-500',
        'ada': 'bg-gradient-to-r from-blue-600 to-purple-600',
        'sol': 'bg-gradient-to-r from-purple-500 to-pink-500',
        'xrp': 'bg-gradient-to-r from-blue-400 to-cyan-400',
        'dot': 'bg-gradient-to-r from-pink-500 to-red-500',
        'doge': 'bg-gradient-to-r from-yellow-400 to-orange-400',
        'avax': 'bg-gradient-to-r from-red-500 to-pink-500',
        'matic': 'bg-gradient-to-r from-purple-600 to-indigo-600',
        'link': 'bg-gradient-to-r from-blue-500 to-cyan-500',
        'uni': 'bg-gradient-to-r from-pink-500 to-purple-500',
        'ltc': 'bg-gradient-to-r from-gray-400 to-gray-600',
        'atom': 'bg-gradient-to-r from-purple-600 to-blue-600',
        'algo': 'bg-gradient-to-r from-gray-800 to-black',
        'trx': 'bg-gradient-to-r from-red-500 to-red-600'
      };
      return colors[symbol.toLowerCase()] || 'bg-gradient-to-r from-gray-500 to-gray-600';
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount);
    },
    formatNumber(amount) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }).format(amount);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    async loadUserData() {
      if (!this.user) return;

      try {
        const portfoliosResponse = await fetch('http://localhost:3000/api/portfolios', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const portfoliosData = await portfoliosResponse.json();
        this.userPortfolios = portfoliosData;

        const transactionsResponse = await fetch('http://localhost:3000/api/transactions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const transactionsData = await transactionsResponse.json();
        this.totalTransactions = transactionsData.length;
        
        const uniqueSymbols = new Set(transactionsData.filter(tx => tx.coin && tx.coin.symbol).map(tx => tx.coin.symbol));
        this.uniqueAssets = uniqueSymbols.size;
        
        this.recentTransactions = transactionsData
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        await this.calcularValoresCarteras();
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    },
    async calcularValoresCarteras() {
      const token = localStorage.getItem('token');
      if (!token) return;
      const valores = {};
      console.log('DEBUG: userPortfolios', this.userPortfolios);
      const transaccionesPorCartera = {};
      for (const cartera of this.userPortfolios) {
        try {
          const res = await fetch(`http://localhost:3000/api/transactions/portfolio/${cartera.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const transacciones = await res.json();
          console.log(`DEBUG: transacciones cartera ${cartera.id}`, transacciones);
          const activosMap = {};
          for (const tx of transacciones) {
            if (!activosMap[tx.coin_id]) {
              activosMap[tx.coin_id] = {
                coin_id: tx.coin_id,
                totalAmount: 0
              };
            }
            if (tx.type === 'buy') {
              activosMap[tx.coin_id].totalAmount += Number(tx.amount);
            } else if (tx.type === 'sell') {
              activosMap[tx.coin_id].totalAmount -= Number(tx.amount);
            }
          }
          const activosUsuario = Object.values(activosMap).filter(a => a.totalAmount > 0);
          let valorTotal = 0;
          if (activosUsuario.length > 0) {
            const precios = await getBackendPrices(activosUsuario.map(a => a.coin_id));
            console.log(`DEBUG: precios cartera ${cartera.id}`, precios);
            for (const activo of activosUsuario) {
              const precio = precios.find(p => p.id === activo.coin_id);
              if (precio && precio.current_price) {
                valorTotal += activo.totalAmount * precio.current_price;
              }
            }
          }
          valores[cartera.id] = valorTotal;
          transaccionesPorCartera[cartera.id] = Array.isArray(transacciones) ? transacciones.length : 0;
        } catch (e) {
          console.error(`Error calculando valor de cartera ${cartera.id}:`, e);
          valores[cartera.id] = 0;
          transaccionesPorCartera[cartera.id] = 0;
        }
      }
      this.carteraValores = valores;
      this.transaccionesPorCartera = transaccionesPorCartera;
      console.log('DEBUG: carteraValores', this.carteraValores);
    },
    getCarteraValue(id) {
      return this.carteraValores[id] ?? 0;
    },
    getTransaccionesPorCartera(carteraId) {
      if (this.transaccionesPorCartera && this.transaccionesPorCartera[carteraId] !== undefined) {
        return this.transaccionesPorCartera[carteraId];
      }
      return 0;
    },
    selectInitialsColor(color) {
      this.selectedAvatarType = 'initials';
      this.selectedAvatarColor = color;
    },
    selectEmoji(emoji) {
      this.selectedAvatarType = 'emoji';
      this.selectedEmoji = emoji;
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          if (this.$root.$notify) {
            this.$root.$notify.error('Por favor selecciona una imagen válida');
          } else {
            alert('Por favor selecciona una imagen válida');
          }
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          if (this.$root.$notify) {
            this.$root.$notify.error('La imagen debe ser menor a 5MB');
          } else {
            alert('La imagen debe ser menor a 5MB');
          }
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let { width, height } = img;
            if (width > 500 || height > 500) {
              const ratio = Math.min(500 / width, 500 / height);
              width *= ratio;
              height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            this.selectedImageUrl = compressedDataUrl;
            this.selectedAvatarType = 'image';
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    async saveAvatar() {
      this.savingAvatar = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autorizado');

        const avatarData = {
          avatar_type: this.selectedAvatarType,
          avatar_color: this.selectedAvatarType === 'initials' ? this.selectedAvatarColor : null,
          avatar_emoji: this.selectedAvatarType === 'emoji' ? this.selectedEmoji : null,
          avatar_url: this.selectedAvatarType === 'image' ? this.selectedImageUrl : null
        };

        const response = await fetch('http://localhost:3000/api/auth/users/avatar', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(avatarData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al guardar el avatar');
        }

        if (this.user) {
          this.user = { ...this.user, ...avatarData };
          localStorage.setItem('crypto-current-user', JSON.stringify(this.user));
        }

        this.showAvatarModal = false;
        this.selectedAvatarType = null;
        this.selectedAvatarColor = null;
        this.selectedEmoji = null;
        this.selectedImageUrl = null;

        if (this.$root.$notify) {
          this.$root.$notify.success(data.message || 'Avatar actualizado correctamente');
        }
      } catch (error) {
        console.error('Error al guardar el avatar:', error);
        if (this.$root.$notify) {
          this.$root.$notify.error(error.message || 'Error al guardar el avatar. Por favor, intenta de nuevo.');
        } else {
          alert('Error al guardar el avatar. Por favor, intenta de nuevo.');
        }
      } finally {
        this.savingAvatar = false;
      }
    }
  },
  watch: {
    showAvatarModal(newVal) {
      if (newVal && this.user) {
        this.selectedAvatarType = this.user.avatar_type || 'initials';
        this.selectedAvatarColor = this.user.avatar_color || 'linear-gradient(to right, #16c784, #13a06b)';
        this.selectedEmoji = this.user.avatar_emoji || null;
        this.selectedImageUrl = this.user.avatar_url || null;
      }
    }
  },
  async mounted() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('http://localhost:3000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          this.user = data.user;
          localStorage.setItem('crypto-current-user', JSON.stringify(this.user));
          this.loadUserData();
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('crypto-current-user');
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('crypto-current-user');
      }
    }
  }
}
</script> 