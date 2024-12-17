// backend/handlers/Class.js
const express = require('express');
const router = express.Router();
const pool = require('../../db.js');

router.post('/saveClass', async (req, res) => {
  const { name, attackBonus, attackPower, spellAttack, spellPower, health, armorClass } = req.body;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO Classes (name, attackBonus, attackPower, spellAttack, spellPower, health, armorClass) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [name, attackBonus, attackPower, spellAttack, spellPower, health, armorClass]
    );
    res.status(201).json({ id: result.insertId, name, attackBonus, attackPower, spellAttack, spellPower, health, armorClass });
  } catch (err) {
    console.error('Error saving class:', err);
    res.status(500).json({ error: 'Error saving class.' });
  }
});

router.get('/getClasses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Classes');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching classes:', err);
    res.status(500).json({ error: 'Error fetching classes.' });
  }
});

module.exports = router;