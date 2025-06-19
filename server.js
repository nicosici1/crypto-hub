const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar configuración de base de datos
const { pool, testConnection } = require('./src/config/database');

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

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware de autenticación
const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    console.log('Autenticando usuario:', userId);
    
    if (!userId) {
      console.log('Usuario no autenticado');
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar si el usuario existe
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );
    connection.release();

    if (users.length === 0) {
      console.log('Creando nuevo usuario:', userId);
      // Si el usuario no existe, lo creamos
      const newConnection = await pool.getConnection();
      await newConnection.execute(
        'INSERT INTO users (id) VALUES (?)',
        [userId]
      );
      newConnection.release();
    }

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
    const isConnected = await testConnection();
    res.json({
      status: 'ok',
      database: isConnected ? 'connected' : 'disconnected',
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
    // Probar conexión a la base de datos
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Base de datos: ${process.env.DB_HOST || 'localhost'}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer(); 