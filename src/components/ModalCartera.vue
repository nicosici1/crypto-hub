<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div class="bg-[#23242a] rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
      <!-- Botón cerrar -->
      <button 
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>

      <!-- Título -->
      <h2 class="text-xl font-bold text-white mb-6">
        {{ editMode ? 'Editar cartera' : 'Crear nueva cartera' }}
      </h2>

      <!-- Formulario -->
      <form @submit.prevent="guardarCartera" class="space-y-4">
        <!-- Nombre -->
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-300 mb-1">
            Nombre de la cartera
          </label>
          <input
            id="nombre"
            v-model="nombre"
            type="text"
            class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            placeholder="Ej: Mi Portfolio Principal"
            required
          />
        </div>

        <!-- Marcar como predeterminada -->
        <div class="flex items-center gap-2">
          <input
            id="default"
            v-model="isDefault"
            type="checkbox"
            class="w-4 h-4 text-blue-500 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
          />
          <label for="default" class="text-sm text-gray-300">
            Marcar como cartera predeterminada
          </label>
        </div>

        <!-- Botones -->
        <div class="flex justify-end gap-2 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded bg-blue-500 text-white font-bold hover:bg-blue-600"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Guardando...
            </span>
            <span v-else>{{ editMode ? 'Guardar cambios' : 'Crear cartera' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { backendApi } from '../services/api';

export default {
  name: 'ModalCartera',
  props: {
    editMode: {
      type: Boolean,
      default: false
    },
    cartera: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      nombre: this.cartera?.name || '',
      isDefault: this.cartera?.is_default || false,
      loading: false,
      error: null
    }
  },
  methods: {
    async guardarCartera() {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autorizado');

        const data = {
          name: this.nombre,
          is_default: this.isDefault
        };

        if (this.editMode) {
          await backendApi.put(`/portfolios/${this.cartera.id}`, data, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (this.$root.$notify) {
            this.$root.$notify.success('Cartera actualizada correctamente');
          }
        } else {
          await backendApi.post('/portfolios', data, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (this.$root.$notify) {
            this.$root.$notify.success('Cartera creada correctamente');
          }
        }

        this.$emit('saved');
        this.$emit('close');
      } catch (error) {
        console.error('Error al guardar la cartera:', error);
        const errorMessage = error.response?.data?.message || 'Error al guardar la cartera';
        
        if (this.$root.$notify) {
          this.$root.$notify.error(errorMessage);
        } else {
          this.error = errorMessage;
        }
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style> 