<template>
  <div class="favorites-view">
    <h1>Seguimiento</h1>
    <p>Estas son las criptomonedas que tienes en seguimiento.</p>
    <FavoritesList />
  </div>
</template>

<script>
import FavoritesList from '../components/FavoritesList.vue'

export default {
  name: 'FavoritesView',
  components: {
    FavoritesList
  }
}
</script>

<style scoped>
.favorites-view {
  padding: 2rem;
}
</style> 