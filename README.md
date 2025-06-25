# 🚀 Crypto Hub - Plataforma de Gestión de Criptomonedas

Una aplicación web completa para el seguimiento y gestión de inversiones en criptomonedas, desarrollada con Vue.js 3 y Node.js.

## 📋 Características Principales

- **📊 Dashboard de Criptomonedas**: Listado en tiempo real con precios actualizados
- **⭐ Sistema de Favoritos**: Guarda y sigue tus criptomonedas preferidas
- **💼 Gestión de Portfolios**: Crea múltiples carteras de inversión
- **💰 Registro de Transacciones**: Compra y venta con historial completo
- **👤 Perfil de Usuario**: Sistema de avatares personalizables
- **📱 Diseño Responsivo**: Optimizado para móviles y desktop
- **🔐 Autenticación JWT**: Sistema seguro de login/registro

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Vue.js 3** - Framework principal
- **Vue Router 4** - Navegación SPA
- **Axios** - Cliente HTTP
- **TailwindCSS** - Framework de estilos
- **Day.js** - Manejo de fechas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **CORS** - Cross-origin resource sharing

### Base de Datos
- **MySQL 8.0+** - Sistema de gestión de base de datos
- **InnoDB** - Motor transaccional
- **Índices optimizados** - Para consultas rápidas

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+ 
- MySQL 8.0+ o MariaDB 10.5+
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd crypto-hub
```

### 2. Configurar la Base de Datos
```bash
# Ejecutar el esquema completo
mysql -u root -p < database/complete_schema.sql
```

**Alternativa**: Usar MySQL Workbench o phpMyAdmin para ejecutar el archivo `database/complete_schema.sql`

### 3. Configurar Variables de Entorno

#### Backend (.env en directorio backend/)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=crypto_hub
DB_PORT=3306
JWT_SECRET=tu_secreto_jwt_super_seguro
PORT=3000
```

#### Frontend (.env en directorio raíz/)
```env
VUE_APP_API_URL=http://localhost:3000/api
```

### 4. Instalar Dependencias

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
# Desde el directorio raíz
npm install
```

### 5. Ejecutar la Aplicación

#### Backend
```bash
cd backend
npm run dev
```
El servidor estará disponible en `http://localhost:3000`

#### Frontend
```bash
# Desde el directorio raíz
npm run serve
```
La aplicación estará disponible en `http://localhost:8080`

## 📁 Estructura del Proyecto

```
crypto-hub/
├── backend/                 # Servidor Node.js/Express
│   ├── src/
│   │   ├── config/         # Configuración de BD
│   │   ├── middleware/     # Middlewares (auth)
│   │   ├── routes/         # Rutas de la API
│   │   └── index.js        # Punto de entrada
│   ├── package.json
│   └── server.js
├── database/               # Archivos de base de datos
│   ├── complete_schema.sql # Esquema completo (RECOMENDADO)
│   ├── schema.sql          # Esquema básico (legacy)
│   └── README.md           # Documentación de BD
├── src/                    # Frontend Vue.js
│   ├── components/         # Componentes Vue
│   ├── views/             # Vistas/páginas
│   ├── router/            # Configuración de rutas
│   ├── services/          # Servicios API
│   └── assets/            # Recursos estáticos
├── public/                # Archivos públicos
└── package.json           # Dependencias frontend
```

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/users/avatar` - Actualizar avatar

### Portfolios
- `GET /api/portfolios` - Obtener portfolios del usuario
- `POST /api/portfolios` - Crear nuevo portfolio
- `PUT /api/portfolios/:id` - Actualizar portfolio
- `DELETE /api/portfolios/:id` - Eliminar portfolio

### Transacciones
- `GET /api/transactions` - Obtener transacciones
- `POST /api/transactions` - Crear transacción
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción

### Favoritos
- `GET /api/favorites` - Obtener favoritos
- `POST /api/favorites` - Agregar favorito
- `DELETE /api/favorites/:coinId` - Eliminar favorito

### Precios
- `GET /api/prices` - Obtener precios de criptomonedas

## 📊 Base de Datos

### Tablas Principales
- **users**: Información de usuarios y avatares
- **portfolios**: Carteras de inversión
- **transactions**: Transacciones de compra/venta
- **favorites**: Criptomonedas favoritas

### Características
- ✅ Normalización completa
- ✅ Integridad referencial
- ✅ Índices optimizados
- ✅ Vistas para reportes
- ✅ Procedimientos almacenados

Ver `database/README.md` para documentación completa.

## 🎨 Componentes Vue

### Principales
- `CryptoList.vue` - Listado de criptomonedas
- `CryptoDetail.vue` - Detalle de criptomoneda
- `PortfolioManager.vue` - Gestión de portfolios
- `ModalTransaccion.vue` - Modal para transacciones
- `FavoritesList.vue` - Lista de favoritos
- `ProfileManager.vue` - Gestión de perfil
- `Navbar.vue` - Navegación principal

### Características de Componentes
- ✅ Comunicación padre-hijo con props/emit
- ✅ Directivas v-if/v-else
- ✅ v-bind con operadores ternarios
- ✅ v-for para listas dinámicas
- ✅ Eventos personalizados

## 🔒 Seguridad

- Autenticación JWT
- Contraseñas encriptadas con bcrypt
- Validación de datos en frontend y backend
- CORS configurado
- Sanitización de inputs

## 📱 Responsive Design

- Diseño mobile-first
- Componentes adaptativos
- Navegación optimizada para móviles
- Interfaz intuitiva

## 🚀 Despliegue

### Backend (Railway/Heroku)
```bash
cd backend
npm run build
```

### Frontend (Netlify/Vercel)
```bash
npm run build
```

## 📝 Notas para el Profesor

### Requisitos Cumplidos
- ✅ Vue.js 3 con CLI
- ✅ 4+ vínculos navegables con vue-router
- ✅ 4+ componentes funcionales
- ✅ Diseño personalizado en español
- ✅ Imágenes atractivas
- ✅ Directivas v-if/v-else
- ✅ v-bind con operador ternario
- ✅ Fetch hacia base de datos online
- ✅ CRUD completo con base de datos
- ✅ Relación padre-hijo con props/emit
- ✅ Animaciones y transiciones

### Funcionalidades Extra
- 🔥 Sistema de avatares personalizables
- 🔥 Múltiples portfolios por usuario
- 🔥 API de precios en tiempo real
- 🔥 Sistema de favoritos
- 🔥 Historial completo de transacciones
- 🔥 Diseño responsive profesional
- 🔥 Autenticación JWT segura

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 👨‍💻 Autor

**Tu Nombre** - [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com)

---

⭐ Si este proyecto te ayudó, ¡dale una estrella!