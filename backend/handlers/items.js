const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all items
router.get('/items', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM items');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new item
router.post('/items', async (req, res) => {
  const { name, description } = req.body;
  try {
    const [result] = await db.query('INSERT INTO items (name, description) VALUES (?, ?)', [name, description]);
    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;