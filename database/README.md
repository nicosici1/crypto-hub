# 🗄️ Base de Datos - Crypto Hub

Este directorio contiene todos los archivos relacionados con la base de datos del proyecto Crypto Hub.

## 📁 Archivos Incluidos

- **`complete_schema.sql`** - Esquema completo de la base de datos

### 1. Requisitos Previos
- MySQL 8.0+ o MariaDB 10.5+

### 2. Crear la Base de Datos
```bash
# Opción 1: Desde línea de comandos (ejecutar el archivo en el gestor de base de datos MySQL)
# reemplazando root por su usuario de MySQL si es diferente
mysql -u root -p < database/complete_schema.sql

# Opción 2: Desde MySQL Workbench o phpMyAdmin
# Copiar y pegar el contenido de complete_schema.sql
```

### 3. Configurar Variables de Entorno
Crear archivo `.env` en el directorio `backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=crypto_hub
DB_PORT=3306
JWT_SECRET=tu_secreto_jwt_super_seguro
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

#### 1. `users` - Usuarios del Sistema
- **Campos**: id, name, email, password, avatar_type, avatar_color, avatar_emoji, avatar_url
- **Características**: Sistema de avatares personalizables (iniciales, emoji, imagen)

#### 2. `portfolios` - Carteras de Inversión
- **Campos**: id, user_id, name, is_default
- **Relación**: Cada usuario puede tener múltiples carteras
- **Características**: Una cartera por defecto se crea automáticamente

#### 3. `transactions` - Transacciones de Criptomonedas
- **Campos**: id, user_id, portfolio_id, coin_id, coin_name, coin_symbol, coin_image, type, amount, price, date, fee, notes
- **Tipos**: 'buy' (compra) y 'sell' (venta)
- **Características**: Registro completo de todas las operaciones

#### 4. `favorites` - Criptomonedas Favoritas
- **Campos**: id, user_id, coin_id
- **Características**: Lista personalizada por usuario, sin duplicados

### Vistas Útiles

#### `portfolio_summary`
- Resumen de holdings por portfolio
- Calcula balances netos por criptomoneda
- Incluye precio promedio y número de transacciones

#### `user_stats`
- Estadísticas generales por usuario
- Conteo de portfolios, transacciones y favoritos
- Totales invertidos y vendidos

### Procedimientos Almacenados

#### `CreateUserWithDefaultPortfolio(name, email, password)`
- Crea un usuario y su portfolio por defecto automáticamente
- Retorna el ID del usuario creado

#### `GetPortfolioBalance(user_id, portfolio_id)`
- Obtiene el balance actual de un portfolio específico
- Calcula cantidades netas por criptomoneda

## 🔧 Mantenimiento

### Verificar Integridad
```sql
-- Verificar relaciones
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'crypto_hub';

-- Verificar índices
SHOW INDEX FROM crypto_hub.users;
SHOW INDEX FROM crypto_hub.transactions;
SHOW INDEX FROM crypto_hub.portfolios;
SHOW INDEX FROM crypto_hub.favorites;
```

## 📈 Optimización

### Índices Creados
- `idx_email` en users (para login rápido)
- `idx_user_id` en portfolios, transactions, favorites
- `idx_coin_id` en transactions, favorites
- `idx_date` en transactions (para filtros por fecha)
- `idx_transactions_user_date` (compuesto)
- `idx_transactions_portfolio_coin` (compuesto)

### Configuración Recomendada
```sql
-- Configurar buffer pool (ajustar según RAM disponible)
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB

-- Configurar query cache
SET GLOBAL query_cache_size = 67108864; -- 64MB
SET GLOBAL query_cache_type = 1;
```


