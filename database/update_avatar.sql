-- Script para agregar campos de avatar a la tabla users existente
USE crypto_hub;

-- Agregar campos de avatar si no existen
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_type ENUM('initials', 'emoji', 'image') DEFAULT 'initials',
ADD COLUMN IF NOT EXISTS avatar_color VARCHAR(100) DEFAULT 'bg-gradient-to-r from-[#16c784] to-[#13a06b]',
ADD COLUMN IF NOT EXISTS avatar_emoji VARCHAR(10),
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Actualizar usuarios existentes para que tengan el avatar por defecto
UPDATE users SET 
    avatar_type = 'initials',
    avatar_color = 'bg-gradient-to-r from-[#16c784] to-[#13a06b]'
WHERE avatar_type IS NULL; 