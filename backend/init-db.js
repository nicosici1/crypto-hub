const mysql = require('mysql2/promise');

async function initializeDatabase() {
  try {
    // Crear conexión sin base de datos
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('Conectado al servidor MySQL');

    // Crear la base de datos si no existe
    await connection.query('CREATE DATABASE IF NOT EXISTS crypto_hub');
    console.log('Base de datos creada o ya existente');

    // Usar la base de datos
    await connection.query('USE crypto_hub');

    // Crear tabla de usuarios
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla de usuarios creada o ya existente');

    // Crear tabla de transacciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        asset_id VARCHAR(255) NOT NULL,
        asset_name VARCHAR(255) NOT NULL,
        asset_symbol VARCHAR(50) NOT NULL,
        amount DECIMAL(20,8) NOT NULL,
        price DECIMAL(20,8) NOT NULL,
        type ENUM('buy', 'sell') NOT NULL,
        total DECIMAL(20,8) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id VARCHAR(255) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Tabla de transacciones creada o ya existente');

    await connection.end();
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initializeDatabase(); 