const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Obtener todas las carteras del usuario
router.get('/', auth, async (req, res) => {
  try {
    const [portfolios] = await pool.execute(
      'SELECT * FROM portfolios WHERE user_id = ?',
      [req.user.id]
    );
    res.json(portfolios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las carteras' });
  }
});

// Crear nueva cartera
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO portfolios (user_id, name, is_default) VALUES (?, ?, ?)',
      [req.user.id, name, false]
    );
    res.status(201).json({
      id: result.insertId,
      user_id: req.user.id,
      name,
      is_default: false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la cartera' });
  }
});

// Actualizar cartera
router.put('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await pool.execute(
      'UPDATE portfolios SET name = ? WHERE id = ? AND user_id = ?',
      [name, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cartera no encontrada' });
    }
    res.json({ message: 'Cartera actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la cartera' });
  }
});

// Eliminar cartera
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM portfolios WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cartera no encontrada' });
    }
    res.json({ message: 'Cartera eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la cartera' });
  }
});

module.exports = router; 