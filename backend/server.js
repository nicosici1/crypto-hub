const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar configuración de base de datos
const { pool } = require('./src/config/database');

const app = express();

// Rutas modulares
const authRoutes = require('./src/routes/auth');
const portfolioRoutes = require('./src/routes/portfolios');
const transactionRoutes = require('./src/routes/transactions');
const favoriteRoutes = require('./src/routes/favorites');
const pricesRoutes = require('./src/routes/prices');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  next();
});

// Middleware de autenticación
const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar si el usuario existe
    // (Este bloque puede ser adaptado a PostgreSQL si lo necesitas)
    // const { rows: users } = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    // if (users.length === 0) {
    //   await pool.query('INSERT INTO users (id) VALUES ($1)', [userId]);
    // }

    req.userId = userId;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(500).json({ error: 'Error en autenticación' });
  }
};

// Usar rutas modulares
app.use('/api/auth', authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/prices', pricesRoutes);

// Ruta de health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 3000;

// Inicializar servidor
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer(); 