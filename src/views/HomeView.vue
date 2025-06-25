<template>
  <div class="max-w-[1400px] mx-auto px-4">
    <div class="mb-6 mt-4">
      <h1 class="text-lg font-semibold text-white">CryptoHub</h1>
      <p class="text-base text-gray-200 mb-2">¡Bienvenido a tu centro de seguimiento de criptomonedas!</p>
      <h2 class="text-3xl font-extrabold text-white">Listado de Criptomonedas</h2>
    </div>
    <CryptoList />
  </div>
</template>

<script>
import CryptoList from '../components/CryptoList.vue'

export default {
  name: 'HomeView',
  components: {
    CryptoList
  }
}
</script>

<style scoped>
.home {
  padding: 2rem;
}
</style>
