<template>
  <header class="w-full bg-[#161b22] shadow-md border-b border-[#23242a] sticky top-0 z-20">
    <nav class="max-w-[1400px] mx-auto px-4 flex items-center h-16 w-full">
      <!-- Logo y Cryptocurrencies a la izquierda -->
      <div class="flex items-center gap-6 flex-shrink-0">
        <router-link to="/" class="flex items-center gap-2">
          <img src="/favicon.ico" alt="CryptoHub Logo" class="w-8 h-8" />
          <span class="ml-2 text-xl font-bold text-white select-none">Crypto<strong>Hub</strong></span>
        </router-link>
        <router-link to="/" exact class="text-white font-semibold text-base px-3 py-1 rounded-md transition hover:bg-[#23242a] hover:text-[#16c784]" active-class="text-[#16c784] bg-[#23242a]">Cryptocurrencies</router-link>
      </div>
      <div class="flex-1"></div>
      <!-- Menú desktop -->
      <div class="hidden sm:flex items-center gap-5 sm:gap-2 mt-0 sm:mt-2">
        <router-link to="/portfolio" class="text-white font-semibold text-base px-3 py-1 rounded-md transition hover:bg-[#23242a] hover:text-[#16c784]" active-class="text-[#16c784] bg-[#23242a]">
          <svg class="inline w-5 h-5 mr-1 -mt-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
            <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          Portafolio
        </router-link>
        <router-link to="/favoritas" class="text-white font-semibold text-base px-3 py-1 rounded-md transition hover:bg-[#23242a] hover:text-[#16c784] relative" active-class="text-[#16c784] bg-[#23242a]">
          <svg class="inline w-5 h-5 mr-1 -mt-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          Seguimiento
        </router-link>
        <router-link to="/perfil" class="text-white font-semibold text-base px-3 py-1 rounded-md transition hover:bg-[#23242a] hover:text-[#16c784]" active-class="text-[#16c784] bg-[#23242a]">
          Perfil
        </router-link>
        <button v-if="isLoggedIn" @click="logout" class="ml-1 p-1 rounded-full hover:bg-[#23242a] transition" style="line-height: 1;" title="Cerrar sesión">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400 hover:text-red-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
      <!-- Botón hamburguesa -->
      <button @click="toggleMenu" class="sm:hidden flex items-center justify-center w-10 h-10 rounded-md bg-[#23242a] hover:bg-[#222b] transition ml-2" aria-label="Abrir menú">
        <svg v-if="!menuOpen" class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        <svg v-else class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </nav>
    <!-- Menú mobile -->
    <transition name="fade">
      <div v-if="menuOpen" class="sm:hidden bg-[#161b22] border-t border-[#23242a] px-6 py-4 flex flex-col gap-2 animate-fadeIn absolute w-full left-0 top-16 z-30 shadow-lg">
        <router-link @click="closeMenu" to="/" exact class="text-white font-semibold text-base px-3 py-2 rounded-md transition hover:bg-[#23242a] hover:text-[#16c784]" active-class="text-[#16c784] bg-[#23242a]">Cryptocurrencies</router-link>
        <router-link @click="closeMenu" to="/portfolio" class="text-white font-semibold text-base px-3 py-2 rounded-md transition hover:bg-[#23242a] hover:text-[#16c784]" active-class="text-[#16c784] bg-[#23242a]">
          <svg class="inline w-5 h-5 mr-1 -mt-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
            <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          Portafolio
        </router-link>
        <router-link @click="closeMenu" to="/favoritas" class="text-white font-semibold text-base px-3 py-2 rounded-md transition hover:bg-[#23242a] hover:text-[#16c784] relative" active-class="text-[#16c784] bg-[#23242a]">
          <svg class="inline w-5 h-5 mr-1 -mt-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          Seguimiento
        </router-link>
        <router-link @click="closeMenu" to="/perfil" class="text-white font-semibold text-base px-3 py-2 rounded-md transition hover:bg-[#23242a] hover:text-[#16c784]" active-class="text-[#16c784] bg-[#23242a]">
          Perfil
        </router-link>
        <button v-if="isLoggedIn" @click="logout" class="ml-1 p-1 rounded-full hover:bg-[#23242a] transition" style="line-height: 1;" title="Cerrar sesión">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400 hover:text-red-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </transition>
  </header>
</template>

<script>
export default {
  name: 'AppNavbar',
  data() {
    return {
      menuOpen: false,
      favoritesCount: 0,
      user: null
    }
  },
  computed: {
    isLoggedIn() {
      return !!this.user;
    }
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    closeMenu() {
      this.menuOpen = false;
    },
    updateFavoritesCount() {
      try {
        const favs = JSON.parse(localStorage.getItem('crypto-favorites')) || [];
        this.favoritesCount = favs.length;
      } catch {
        this.favoritesCount = 0;
      }
    },
    loadUser() {
      const savedUser = localStorage.getItem('crypto-current-user');
      if (savedUser) {
        this.user = JSON.parse(savedUser);
      }
    },
    logout() {
      this.user = null;
      localStorage.removeItem('crypto-current-user');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      this.$router.push('/');
      setTimeout(() => window.location.reload(), 100);
    }
  },
  mounted() {
    this.updateFavoritesCount();
    this.loadUser();
    window.addEventListener('storage', this.updateFavoritesCount);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.updateFavoritesCount);
  },
  watch: {
    // Si cambia el localStorage desde otro tab, actualiza el contador
    favoritesCount() {
      this.updateFavoritesCount();
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
@media (max-width: 640px) {
  .sm\:flex {
    display: none !important;
  }
  .sm\:inline-block {
    display: none !important;
  }
}
@media (min-width: 641px) {
  .sm\:hidden {
    display: none !important;
  }
}
</style> 