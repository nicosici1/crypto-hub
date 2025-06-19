# 🚀 Guía de Hosting - Crypto Hub Backend

## 📋 Opciones Gratuitas para Base de Datos

### 1. **PlanetScale** (Recomendado) ⭐
- **MySQL compatible** - No requiere cambios en tu código
- **Gratis:** 1 base de datos, 1GB storage, 1B reads/mes
- **Dashboard web** muy intuitivo
- **Escalable** automáticamente

### 2. **Railway**
- **MySQL** disponible
- **Gratis:** $5 de crédito/mes
- **Despliegue automático**

### 3. **Clever Cloud**
- **MySQL** disponible
- **Gratis:** 256MB RAM, 1GB storage
- **Hosting europeo**

---

## 🎯 Configuración en PlanetScale

### Paso 1: Crear cuenta en PlanetScale
1. Ve a [planetscale.com](https://planetscale.com)
2. Regístrate con GitHub
3. Crea una nueva base de datos llamada `crypto_hub`

### Paso 2: Obtener credenciales
1. En el dashboard de PlanetScale, ve a "Connect"
2. Selecciona "Connect with MySQL"
3. Copia las credenciales:
   - Host
   - Username
   - Password
   - Database name

### Paso 3: Configurar variables de entorno
1. En la carpeta `backend/`, crea un archivo `.env`:
```bash
# Copia el contenido de env.example y actualiza con tus credenciales
cp env.example .env
```

2. Edita el archivo `.env` con tus credenciales de PlanetScale:
```env
DB_HOST=aws.connect.psdb.cloud
DB_USER=tu_usuario_de_planetscale
DB_PASSWORD=tu_password_de_planetscale
DB_NAME=crypto_hub
DB_PORT=3306
DB_SSL=true
PORT=3000
NODE_ENV=production
```

### Paso 4: Migrar la base de datos
```bash
cd backend
npm install
node migrate-to-planetscale.js
```

### Paso 5: Probar la conexión
```bash
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en el puerto 3000
🌍 Ambiente: production
📊 Base de datos: aws.connect.psdb.cloud
✅ Conexión a la base de datos establecida correctamente
```

---

## 🌐 Hosting del Backend

### Opción 1: **Railway** (Recomendado)
1. Ve a [railway.app](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno
4. ¡Listo! Se despliega automáticamente

### Opción 2: **Render**
1. Ve a [render.com](https://render.com)
2. Crea un nuevo "Web Service"
3. Conecta tu repositorio
4. Configura las variables de entorno

### Opción 3: **Heroku**
1. Ve a [heroku.com](https://heroku.com)
2. Crea una nueva app
3. Conecta tu repositorio
4. Configura las variables de entorno

---

## 🔧 Variables de Entorno para Producción

```env
# Base de datos (PlanetScale)
DB_HOST=aws.connect.psdb.cloud
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=crypto_hub
DB_PORT=3306
DB_SSL=true

# Servidor
PORT=3000
NODE_ENV=production
```

---

## 📱 Actualizar Frontend

Una vez que tengas tu backend hosteado, actualiza la URL en el frontend:

```javascript
// En src/services/api.js
export const backendApi = axiosBackend.create({
  baseURL: 'https://tu-backend.railway.app/api', // Cambia por tu URL
  timeout: 10000,
});
```

---

## ✅ Verificación

1. **Backend funcionando:**
   ```bash
   curl https://tu-backend.railway.app/api/health
   ```

2. **Base de datos conectada:**
   ```json
   {
     "status": "ok",
     "database": "connected",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

---

## 🆘 Solución de Problemas

### Error de conexión SSL
- Asegúrate de que `DB_SSL=true` en las variables de entorno

### Error de autenticación
- Verifica que las credenciales de PlanetScale sean correctas
- Asegúrate de que la base de datos existe

### Error de CORS
- El backend ya tiene CORS configurado para desarrollo
- Para producción, considera configurar dominios específicos

---

## 🎉 ¡Listo!

Tu aplicación estará completamente hosteada y funcionando en la nube. Los usuarios podrán:
- Registrarse e iniciar sesión
- Gestionar sus portfolios
- Agregar transacciones
- Guardar favoritos
- Todo desde cualquier dispositivo con internet 