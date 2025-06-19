const mysql = require('mysql2/promise');
require('dotenv').config();

// Schema de la base de datos
const schema = `
-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS crypto_hub;
USE crypto_hub;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar_type ENUM('initials', 'emoji', 'image') DEFAULT 'initials',
    avatar_color VARCHAR(100) DEFAULT 'bg-gradient-to-r from-[#16c784] to-[#13a06b]',
    avatar_emoji VARCHAR(10),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de carteras
CREATE TABLE IF NOT EXISTS portfolios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    portfolio_id INT NOT NULL,
    coin_id VARCHAR(50) NOT NULL,
    coin_name VARCHAR(100) NOT NULL,
    coin_symbol VARCHAR(20) NOT NULL,
    coin_image VARCHAR(255),
    type ENUM('buy', 'sell') NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,2) NOT NULL,
    date DATE NOT NULL,
    fee DECIMAL(20,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    coin_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, coin_id)
);
`;

async function migrateToPlanetScale() {
  console.log('🚀 Iniciando migración a PlanetScale...');
  
  // Configuración de PlanetScale
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: {
      rejectUnauthorized: false
    }
  };

  try {
    console.log('📡 Conectando a PlanetScale...');
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Conexión establecida');
    console.log('🗄️ Creando tablas...');
    
    // Ejecutar el schema
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
        console.log('✅ Ejecutado:', statement.substring(0, 50) + '...');
      }
    }
    
    console.log('🎉 Migración completada exitosamente!');
    console.log('📊 Tablas creadas:');
    console.log('   - users');
    console.log('   - portfolios');
    console.log('   - transactions');
    console.log('   - favorites');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.log('\n📋 Verifica que:');
    console.log('   1. Tienes un archivo .env con las credenciales de PlanetScale');
    console.log('   2. Las credenciales son correctas');
    console.log('   3. La base de datos existe en PlanetScale');
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateToPlanetScale();
}

module.exports = { migrateToPlanetScale }; 