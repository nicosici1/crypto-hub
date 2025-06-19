-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS crypto_hub;
USE crypto_hub;

-- Crear la tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id VARCHAR(50) NOT NULL,
  asset_name VARCHAR(100) NOT NULL,
  asset_symbol VARCHAR(20) NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  price DECIMAL(20,2) NOT NULL,
  type ENUM('buy', 'sell') NOT NULL,
  total DECIMAL(20,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_asset_id (asset_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 