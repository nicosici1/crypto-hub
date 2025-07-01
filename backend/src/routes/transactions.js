const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

// Obtener todas las transacciones del usuario
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const { rows: transactions } = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );

    // Anidar objeto coin como antes
    const transactionsWithCoin = transactions.map(tx => ({
      ...tx,
      coin: {
        id: tx.coin_id,
        symbol: tx.coin_symbol,
        name: tx.coin_name,
        image: tx.coin_image
      }
    }));

    res.json(transactionsWithCoin);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener transacciones por cartera
router.get('/portfolio/:portfolioId', auth, async (req, res) => {
  try {
    const { rows: transactions } = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 AND portfolio_id = $2 ORDER BY date DESC',
      [req.user.id, req.params.portfolioId]
    );
    // Anidar objeto coin
    const transactionsWithCoin = transactions.map(tx => ({
      ...tx,
      coin: {
        id: tx.coin_id,
        symbol: tx.coin_symbol,
        name: tx.coin_name,
        image: tx.coin_image
      }
    }));
    res.json(transactionsWithCoin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las transacciones' });
  }
});

// Crear nueva transacción
router.post('/', auth, async (req, res) => {
  try {
    const {
      portfolio_id,
      coin_id,
      coin_name,
      coin_symbol,
      coin_image,
      type,
      amount,
      price,
      date,
      fee,
      notes
    } = req.body;

    const { rows: [result] } = await pool.query(
      `INSERT INTO transactions (
        user_id, portfolio_id, coin_id, coin_name, coin_symbol, coin_image,
        type, amount, price, date, fee, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        req.user.id,
        portfolio_id,
        coin_id,
        coin_name,
        coin_symbol,
        coin_image,
        type,
        amount,
        price,
        date,
        fee || 0,
        notes || ''
      ]
    );

    res.status(201).json({
      id: result.id,
      user_id: req.user.id,
      portfolio_id,
      coin_id,
      coin_name,
      coin_symbol,
      coin_image,
      type,
      amount,
      price,
      date,
      fee: fee || 0,
      notes: notes || ''
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la transacción' });
  }
});

// Actualizar transacción
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      amount,
      price,
      date,
      fee,
      notes
    } = req.body;

    const { rows: [result] } = await pool.query(
      `UPDATE transactions 
       SET amount = $1, price = $2, date = $3, fee = $4, notes = $5
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [amount, price, date, fee || 0, notes || '', req.params.id, req.user.id]
    );

    if (!result) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }

    res.json({ message: 'Transacción actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la transacción' });
  }
});

// Eliminar transacción
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rows: [result] } = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (!result) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }

    res.json({ message: 'Transacción eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la transacción' });
  }
});

// Eliminar todas las transacciones de un activo en un portfolio
router.delete('/', auth, async (req, res) => {
  const { portfolio_id, coin_id } = req.query;
  if (!portfolio_id || !coin_id) {
    return res.status(400).json({ error: 'portfolio_id y coin_id son requeridos' });
  }
  try {
    const { rows: [result] } = await pool.query(
      'DELETE FROM transactions WHERE user_id = $1 AND portfolio_id = $2 AND coin_id = $3 RETURNING *',
      [req.user.id, portfolio_id, coin_id]
    );
    res.json({ success: true, deleted: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando transacciones', details: error.message });
  }
});

module.exports = router; 