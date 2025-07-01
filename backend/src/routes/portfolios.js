const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

// Obtener todas las carteras del usuario
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.id) {
      return res.status(400).json({ message: 'ID de usuario no válido' });
    }
    const { rows: portfolios } = await pool.query(
      'SELECT * FROM portfolios WHERE user_id = $1',
      [req.user.id]
    );
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las carteras' });
  }
});

// Crear nueva cartera
router.post('/', auth, async (req, res) => {
  try {
    const { name, is_default } = req.body;
    
    if (is_default) {
      await pool.query(
        'UPDATE portfolios SET is_default = false WHERE user_id = $1',
        [req.user.id]
      );
    }
    
    const { rows: [result] } = await pool.query(
      'INSERT INTO portfolios (user_id, name, is_default) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, name, is_default || false]
    );
    
    res.status(201).json({
      id: result.id,
      user_id: req.user.id,
      name,
      is_default: is_default || false
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la cartera' });
  }
});

// Actualizar cartera
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, is_default } = req.body;
    
    if (is_default) {
      await pool.query(
        'UPDATE portfolios SET is_default = false WHERE user_id = $1',
        [req.user.id]
      );
    }
    
    const { rows: [result] } = await pool.query(
      'UPDATE portfolios SET name = $1, is_default = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [name, is_default || false, req.params.id, req.user.id]
    );
    
    if (!result) {
      return res.status(404).json({ message: 'Cartera no encontrada' });
    }
    
    res.json({ 
      message: 'Cartera actualizada exitosamente',
      portfolio: {
        id: req.params.id,
        name,
        is_default: is_default || false
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la cartera' });
  }
});

// Eliminar cartera
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rows: portfolios } = await pool.query(
      'SELECT * FROM portfolios WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (portfolios.length === 0) {
      return res.status(404).json({ message: 'Cartera no encontrada' });
    }
    
    const portfolio = portfolios[0];
    
    if (portfolio.is_default) {
      const { rows: allPortfolios } = await pool.query(
        'SELECT COUNT(*) as count FROM portfolios WHERE user_id = $1',
        [req.user.id]
      );
      
      if (allPortfolios[0].count <= 1) {
        return res.status(400).json({ 
          message: 'No se puede eliminar la única cartera. Crea otra cartera antes de eliminar esta.' 
        });
      }
    }
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      await connection.query(
        'DELETE FROM transactions WHERE portfolio_id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
      );
      
      const { rows: [result] } = await connection.query(
        'DELETE FROM portfolios WHERE id = $1 AND user_id = $2 RETURNING *',
        [req.params.id, req.user.id]
      );
      
      await connection.commit();
      
      res.json({ 
        message: 'Cartera eliminada exitosamente',
        deletedPortfolio: {
          id: req.params.id,
          name: portfolio.name
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la cartera' });
  }
});

// Establecer cartera como predeterminada
router.patch('/:id/set-default', auth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE portfolios SET is_default = false WHERE user_id = $1',
      [req.user.id]
    );
    
    const { rows: [result] } = await pool.query(
      'UPDATE portfolios SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    
    if (!result) {
      return res.status(404).json({ message: 'Cartera no encontrada' });
    }
    
    res.json({ 
      message: 'Cartera establecida como predeterminada exitosamente',
      portfolio: {
        id: req.params.id,
        is_default: true
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al establecer la cartera como predeterminada' });
  }
});

module.exports = router; 