<template>
  <div id="app" class="min-h-screen bg-[#161b22] text-gray-100 font-sans">
    <AppNavbar />
    <main class="max-w-[1400px] mx-auto w-full px-4 sm:px-2 pt-6 pb-10">
      <router-view/>
    </main>
  </div>
</template>

<script>
import AppNavbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: { AppNavbar }
}
</script>
