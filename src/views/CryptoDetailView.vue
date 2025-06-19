<template>
  <div class="crypto-detail-view">
    <h1>Detalle de Criptomoneda</h1>
    <p>Aquí se mostrará la información detallada de la cripto seleccionada.</p>
    <CryptoDetail />
  </div>
</template>

<script>
import CryptoDetail from '../components/CryptoDetail.vue'

export default {
  name: 'CryptoDetailView',
  components: {
    CryptoDetail
  }
}
</script>

<style scoped>
.crypto-detail-view {
  padding: 2rem;
}
</style> 