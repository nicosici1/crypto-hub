<template>
  <div class="max-w-[1400px] mx-auto px-4">
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
