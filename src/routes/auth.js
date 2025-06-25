const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const auth = require('../middleware/auth');

// Registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const [existingUsers] = await db.pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    await db.pool.execute(
      'INSERT INTO portfolios (user_id, name, is_default) VALUES (?, ?, ?)',
      [result.insertId, 'Mi Portfolio Principal', true]
    );

    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = users[0];

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

router.put('/users/avatar', auth, async (req, res) => {
  try {
    const { avatar_type, avatar_color, avatar_emoji, avatar_url } = req.body;
    const userId = req.user.id;

    if (!avatar_type || !['initials', 'emoji', 'image'].includes(avatar_type)) {
      return res.status(400).json({ message: 'Tipo de avatar inválido' });
    }

    const updateData = {
      avatar_type,
      avatar_color: avatar_type === 'initials' ? avatar_color : null,
      avatar_emoji: avatar_type === 'emoji' ? avatar_emoji : null,
      avatar_url: avatar_type === 'image' ? avatar_url : null
    };

    const [result] = await db.pool.execute(
      'UPDATE users SET avatar_type = ?, avatar_color = ?, avatar_emoji = ?, avatar_url = ? WHERE id = ?',
      [updateData.avatar_type, updateData.avatar_color, updateData.avatar_emoji, updateData.avatar_url, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const [users] = await db.pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    const updatedUser = users[0];

    res.json({
      message: 'Avatar actualizado correctamente',
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
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await db.pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = users[0];

    res.json({
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
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router; 