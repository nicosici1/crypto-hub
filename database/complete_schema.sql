-- =====================================================
-- CRYPTO HUB - ESQUEMA COMPLETO DE BASE DE DATOS
-- =====================================================
-- Este archivo contiene todo lo necesario para recrear
-- la base de datos completa del proyecto Crypto Hub
-- =====================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS crypto_hub;
USE crypto_hub;

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
-- Almacena información de los usuarios registrados
-- Incluye sistema de avatares personalizables
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA DE CARTERAS/PORTFOLIOS
-- =====================================================
-- Permite a los usuarios crear múltiples carteras
-- Cada usuario tiene una cartera por defecto
CREATE TABLE IF NOT EXISTS portfolios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA DE TRANSACCIONES
-- =====================================================
-- Registra todas las compras y ventas de criptomonedas
-- Incluye información detallada de cada transacción
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
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_portfolio_id (portfolio_id),
    INDEX idx_coin_id (coin_id),
    INDEX idx_date (date),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA DE FAVORITOS
-- =====================================================
-- Lista de criptomonedas favoritas por usuario
-- Permite seguimiento rápido de precios
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    coin_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, coin_id),
    INDEX idx_user_id (user_id),
    INDEX idx_coin_id (coin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================
-- Descomenta las siguientes líneas si quieres insertar
-- datos de ejemplo para pruebas

/*
-- Insertar usuario de ejemplo
INSERT INTO users (name, email, password, avatar_type, avatar_color) VALUES 
('Usuario Demo', 'demo@cryptohub.com', '$2a$10$example.hash.password', 'initials', 'bg-gradient-to-r from-[#16c784] to-[#13a06b]');

-- Insertar cartera por defecto para el usuario demo
INSERT INTO portfolios (user_id, name, is_default) VALUES 
(1, 'Mi Portfolio Principal', TRUE);

-- Insertar algunas transacciones de ejemplo
INSERT INTO transactions (user_id, portfolio_id, coin_id, coin_name, coin_symbol, coin_image, type, amount, price, date, fee, notes) VALUES 
(1, 1, 'bitcoin', 'Bitcoin', 'BTC', 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', 'buy', 0.001, 45000.00, '2024-01-15', 5.00, 'Primera compra de Bitcoin'),
(1, 1, 'ethereum', 'Ethereum', 'ETH', 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', 'buy', 0.01, 3000.00, '2024-01-20', 3.00, 'Compra de Ethereum'),
(1, 1, 'cardano', 'Cardano', 'ADA', 'https://assets.coingecko.com/coins/images/975/large/Cardano.png', 'buy', 100, 0.50, '2024-02-01', 1.00, 'Inversión en Cardano');

-- Insertar algunos favoritos de ejemplo
INSERT INTO favorites (user_id, coin_id) VALUES 
(1, 'bitcoin'),
(1, 'ethereum'),
(1, 'cardano'),
(1, 'solana');
*/

-- =====================================================
-- VISTAS ÚTILES (OPCIONAL)
-- =====================================================
-- Vista para obtener resumen de portfolio por usuario
CREATE OR REPLACE VIEW portfolio_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    p.id as portfolio_id,
    p.name as portfolio_name,
    t.coin_id,
    t.coin_name,
    t.coin_symbol,
    SUM(CASE WHEN t.type = 'buy' THEN t.amount ELSE -t.amount END) as total_amount,
    AVG(t.price) as avg_price,
    COUNT(*) as transaction_count
FROM users u
JOIN portfolios p ON u.id = p.user_id
LEFT JOIN transactions t ON p.id = t.portfolio_id
GROUP BY u.id, p.id, t.coin_id, t.coin_name, t.coin_symbol
HAVING total_amount > 0;

-- Vista para obtener estadísticas de usuario
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(DISTINCT p.id) as portfolio_count,
    COUNT(t.id) as transaction_count,
    COUNT(f.id) as favorites_count,
    SUM(CASE WHEN t.type = 'buy' THEN t.amount * t.price ELSE 0 END) as total_invested,
    SUM(CASE WHEN t.type = 'sell' THEN t.amount * t.price ELSE 0 END) as total_sold
FROM users u
LEFT JOIN portfolios p ON u.id = p.user_id
LEFT JOIN transactions t ON u.id = t.user_id
LEFT JOIN favorites f ON u.id = f.user_id
GROUP BY u.id, u.name, u.email;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES (OPCIONAL)
-- =====================================================
DELIMITER //

-- Procedimiento para crear usuario con portfolio por defecto
CREATE PROCEDURE CreateUserWithDefaultPortfolio(
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE new_user_id INT;
    
    -- Insertar usuario
    INSERT INTO users (name, email, password) VALUES (p_name, p_email, p_password);
    SET new_user_id = LAST_INSERT_ID();
    
    -- Crear portfolio por defecto
    INSERT INTO portfolios (user_id, name, is_default) VALUES (new_user_id, 'Mi Portfolio Principal', TRUE);
    
    SELECT new_user_id as user_id;
END //

-- Procedimiento para obtener balance de portfolio
CREATE PROCEDURE GetPortfolioBalance(
    IN p_user_id INT,
    IN p_portfolio_id INT
)
BEGIN
    SELECT 
        coin_id,
        coin_name,
        coin_symbol,
        SUM(CASE WHEN type = 'buy' THEN amount ELSE -amount END) as balance,
        AVG(price) as avg_price
    FROM transactions 
    WHERE user_id = p_user_id AND portfolio_id = p_portfolio_id
    GROUP BY coin_id, coin_name, coin_symbol
    HAVING balance > 0;
END //

DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================
-- Índices para mejorar el rendimiento de consultas frecuentes
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_portfolio_coin ON transactions(portfolio_id, coin_id);
CREATE INDEX idx_favorites_user_coin ON favorites(user_id, coin_id);

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================
-- Este esquema incluye:
-- ✅ Tabla de usuarios con sistema de avatares
-- ✅ Tabla de portfolios/carteras
-- ✅ Tabla de transacciones completa
-- ✅ Tabla de favoritos
-- ✅ Vistas útiles para consultas
-- ✅ Procedimientos almacenados
-- ✅ Índices optimizados
-- ✅ Datos de ejemplo (comentados)
-- 
-- Para usar este archivo:
-- 1. Ejecutar en MySQL/MariaDB
-- 2. Descomentar datos de ejemplo si se desean
-- 3. Configurar las variables de entorno del backend
-- 4. ¡Listo para usar! 