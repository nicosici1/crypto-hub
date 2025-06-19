<template>
  <div class="min-h-screen bg-[#161b22] text-white">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white">Mi Perfil</h1>
        <p class="text-gray-400 mt-2">Gestiona tu cuenta y visualiza tus estadísticas</p>
      </div>
      <ProfileManager @login-success="onLoginSuccess" @logout="onLogout" />
    </div>
  </div>
</template>

<script>
import ProfileManager from '../components/ProfileManager.vue'

export default {
  name: 'ProfileView',
  components: {
    ProfileManager
  },
  methods: {
    onLoginSuccess() {
      // No redirigir automáticamente
    },
    onLogout() {
      // No redirigir automáticamente
    }
  }
}
</script> 