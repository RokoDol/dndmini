const express = require('express');
const router = express.Router();
const pool = require('../../db.js'); // Adjust path to your database connection file

// Route to save a new item
router.post('/saveItem', async (req, res) => {
  const { name, type, attackBonus, defenseBonus, frequency, description, diceType, weapRange } = req.body; // Include weapRange

  try {
    const [result] = await pool.query(
      'INSERT INTO Items (name, type, attackBonus, defenseBonus, frequency, description, diceType, weapRange) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [name, type, attackBonus, defenseBonus, frequency, description, diceType, weapRange]
    );
    res.status(201).json({ id: result.insertId, name, type, attackBonus, defenseBonus, frequency, description, diceType, weapRange });
  } catch (err) {
    console.error('Error saving item:', err);
    res.status(500).json({ error: 'Error saving item.' });
  }
});

// Route to get all items
router.get('/getItems', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Items');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ error: 'Error fetching items.' });
  }
});

module.exports = router;
