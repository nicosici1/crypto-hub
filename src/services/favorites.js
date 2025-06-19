import axios from 'axios';

const API_URL = 'http://localhost:3000/api/favorites';

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