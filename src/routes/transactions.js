const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [transactions] = await pool.execute(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
      [req.user.id]
    );
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

router.get('/portfolio/:portfolioId', auth, async (req, res) => {
  try {
    const [transactions] = await pool.execute(
      'SELECT * FROM transactions WHERE user_id = ? AND portfolio_id = ? ORDER BY date DESC',
      [req.user.id, req.params.portfolioId]
    );
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

    const [result] = await pool.execute(
      `INSERT INTO transactions (
        user_id, portfolio_id, coin_id, coin_name, coin_symbol, coin_image,
        type, amount, price, date, fee, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      id: result.insertId,
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

    const [result] = await pool.execute(
      `UPDATE transactions 
       SET amount = ?, price = ?, date = ?, fee = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [amount, price, date, fee || 0, notes || '', req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }

    res.json({ message: 'Transacción actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la transacción' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }

    res.json({ message: 'Transacción eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la transacción' });
  }
});

router.delete('/', auth, async (req, res) => {
  const { portfolio_id, coin_id } = req.query;
  if (!portfolio_id || !coin_id) {
    return res.status(400).json({ error: 'portfolio_id y coin_id son requeridos' });
  }
  try {
    const [result] = await pool.execute(
      'DELETE FROM transactions WHERE user_id = ? AND portfolio_id = ? AND coin_id = ?',
      [req.user.id, portfolio_id, coin_id]
    );
    res.json({ success: true, deleted: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando transacciones', details: error.message });
  }
});

module.exports = router; 