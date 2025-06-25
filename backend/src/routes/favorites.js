const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

// Obtener favoritos
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Agregar favorito
router.post('/', auth, async (req, res) => {
  try {
    const { coin_id } = req.body;
    
    if (!coin_id) {
      return res.status(400).json({ message: 'coin_id es requerido' });
    }

    const [result] = await pool.execute(
      'INSERT INTO favorites (user_id, coin_id) VALUES (?, ?)',
      [req.user.id, coin_id]
    );

    res.status(201).json({ 
      message: 'Favorito agregado correctamente',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
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