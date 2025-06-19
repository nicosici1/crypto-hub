const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'No autorizado' });
  }
};

// Obtener favoritos
router.get('/', auth, async (req, res) => {
  try {
    console.log('Obteniendo favoritos para usuario:', req.user.id);
    const [rows] = await pool.execute(
      'SELECT * FROM favorites WHERE user_id = ?',
      [req.user.id]
    );
    console.log('Favoritos encontrados:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ message: 'Error al obtener favoritos' });
  }
});

// Agregar favorito
router.post('/', auth, async (req, res) => {
  try {
    const { coin_id } = req.body;
    console.log('Agregando favorito:', { userId: req.user.id, coinId: coin_id });
    const [result] = await pool.execute(
      'INSERT INTO favorites (user_id, coin_id) VALUES (?, ?)',
      [req.user.id, coin_id]
    );
    console.log('Favorito agregado:', result);
    res.status(201).json({
      id: result.insertId,
      user_id: req.user.id,
      coin_id
    });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Esta criptomoneda ya está en favoritos' });
    }
    res.status(500).json({ message: 'Error al agregar a favoritos' });
  }
});

// Eliminar favorito
router.delete('/:coinId', auth, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND coin_id = ?',
      [req.user.id, req.params.coinId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Favorito no encontrado' });
    }
    res.json({ message: 'Favorito eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar de favoritos' });
  }
});

module.exports = router; 