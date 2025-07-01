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

    const { rows } = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
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

    const { rows } = await pool.query(
      'INSERT INTO favorites (user_id, coin_id) VALUES ($1, $2) RETURNING *',
      [req.user.id, coin_id]
    );

    res.status(201).json({ 
      message: 'Favorito agregado correctamente',
      id: rows[0].id 
    });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar favorito
router.delete('/:coinId', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND coin_id = $2 RETURNING *',
      [req.user.id, req.params.coinId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Favorito no encontrado' });
    }
    res.json({ message: 'Favorito eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar de favoritos' });
  }
});

module.exports = router; 