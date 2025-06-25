<template>
  <div class="crypto-detail-view">
    
    <CryptoDetail :coin-id="coinId" />
  </div>
</template>

<script>
import CryptoDetail from '../components/CryptoDetail.vue'

export default {
  name: 'CryptoDetailView',
  components: {
    CryptoDetail
  },
  computed: {
    coinId() {
      return this.$route.params.id;
    }
  }
}
</script>

<style scoped>
.crypto-detail-view {
  padding: 2rem;
}
</style> 