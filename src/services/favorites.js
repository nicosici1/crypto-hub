import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/favorites';

// Crear una instancia de axios con configuración personalizada
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000, // 5 segundos de timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

export const FavoritesService = {
  async getFavorites() {
    const token = localStorage.getItem('token');
    if (!token) return [];
    
    try {
      const response = await api.get('/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      return [];
    }
  },

  async isFavorite(coin_id) {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.coin_id === coin_id);
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      return false;
    }
  },

  async addFavorite(coin_id) {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const response = await api.post('/', { coin_id }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      throw error;
    }
  },

  async removeFavorite(coin_id) {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const response = await api.delete(`/${coin_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      throw error;
    }
  }
}; 