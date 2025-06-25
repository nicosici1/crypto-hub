const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

// Registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Todos los campos son requeridos',
        type: 'error'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
        type: 'error'
      });
    }

    // Verificar si el email ya existe
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'El email ya está registrado. Intenta con otro email o inicia sesión',
        type: 'error'
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Crear cartera por defecto
    await pool.execute(
      'INSERT INTO portfolios (user_id, name, is_default) VALUES (?, ?, ?)',
      [result.insertId, 'Mi Portfolio Principal', true]
    );

    // Generar token
    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: `¡Bienvenido a Crypto Hub, ${name}! Tu cuenta ha sido creada exitosamente`,
      type: 'success',
      token,
      user: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear la cuenta. Por favor, intenta nuevamente',
      type: 'error'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email y contraseña son requeridos',
        type: 'error'
      });
    }

    // Buscar usuario
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Email o contraseña incorrectos. Verifica tus credenciales',
        type: 'error'
      });
    }

    const user = users[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Email o contraseña incorrectos. Verifica tus credenciales',
        type: 'error'
      });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: `¡Bienvenido de vuelta, ${user.name}! Has iniciado sesión correctamente`,
      type: 'success',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al iniciar sesión. Por favor, intenta nuevamente',
      type: 'error'
    });
  }
});

// Endpoint para actualizar avatar del usuario
router.put('/users/avatar', auth, async (req, res) => {
  try {
    const { avatar_type, avatar_color, avatar_emoji, avatar_url } = req.body;
    const userId = req.user.id;

    // Validar datos
    if (!avatar_type || !['initials', 'emoji', 'image'].includes(avatar_type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Tipo de avatar inválido',
        type: 'error'
      });
    }

    // Preparar datos para actualizar
    const updateData = {
      avatar_type,
      avatar_color: avatar_type === 'initials' ? avatar_color : null,
      avatar_emoji: avatar_type === 'emoji' ? avatar_emoji : null,
      avatar_url: avatar_type === 'image' ? avatar_url : null
    };

    // Actualizar en la base de datos
    const [result] = await pool.execute(
      'UPDATE users SET avatar_type = ?, avatar_color = ?, avatar_emoji = ?, avatar_url = ? WHERE id = ?',
      [updateData.avatar_type, updateData.avatar_color, updateData.avatar_emoji, updateData.avatar_url, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado',
        type: 'error'
      });
    }

    // Obtener usuario actualizado
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    const updatedUser = users[0];

    res.json({
      success: true,
      message: 'Avatar actualizado correctamente',
      type: 'success',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar_type: updatedUser.avatar_type,
        avatar_color: updatedUser.avatar_color,
        avatar_emoji: updatedUser.avatar_emoji,
        avatar_url: updatedUser.avatar_url
      }
    });
  } catch (error) {
    console.error('Error al actualizar avatar:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar el avatar. Por favor, intenta nuevamente',
      type: 'error'
    });
  }
});

// Endpoint para obtener perfil del usuario actual
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener usuario de la base de datos
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado',
        type: 'error'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_type: user.avatar_type,
        avatar_color: user.avatar_color,
        avatar_emoji: user.avatar_emoji,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener el perfil. Por favor, intenta nuevamente',
      type: 'error'
    });
  }
});

module.exports = router; 