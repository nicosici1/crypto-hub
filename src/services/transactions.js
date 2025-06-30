import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL + '/transactions';

// Crear una instancia de axios con configuración personalizada
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en la petición:', {
      url: error.config?.url,
      method: error.config?.method,
      requestData: error.config?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const TransactionService = {
  async getTransactions() {
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
      console.error('Error al obtener transacciones:', error);
      throw error;
    }
  },

  async addTransaction(transaction) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');
    
    try {
      console.log('Enviando transacción al servidor:', transaction);
      const response = await api.post('/', transaction, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al agregar transacción:', {
        error,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('Error al crear la transacción');
      }
    }
  },

  async updateTransaction(id, transaction) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');
    
    try {
      const response = await api.put(`/${id}`, transaction, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar transacción:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('Error al actualizar la transacción');
      }
    }
  },

  async deleteTransaction(id) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');
    
    try {
      const response = await api.delete(`/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('Error al eliminar la transacción');
      }
    }
  },

  async getPortfolioSummary() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const response = await api.get('/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener resumen del portfolio:', error);
      throw error;
    }
  },

  async getTransactionsByPortfolio(portfolioId) {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
      const response = await api.get(`/portfolio/${portfolioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener transacciones por portfolio:', error);
      throw error;
    }
  }
}; 