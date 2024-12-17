const express = require('express');
const router = express.Router();
const pool = require('../../db.js');

// Route to save a spell
router.post('/', async (req, res) => {
  const { name, damageType, diceType, description, spellRange, effects, isAoE, aoeRadius, cooldown, classId } = req.body; // Add cooldown to destructured variables
  
  try {
    const [result] = await pool.query(
      'INSERT INTO Spells (name, damageType, diceType, description, spellRange, effects, isAoE, aoeRadius, cooldown, classId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, damageType, diceType, description, spellRange, effects, isAoE, aoeRadius, cooldown, classId] // Add cooldown to the array
    );
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      damageType, 
      diceType, 
      description, 
      spellRange, 
      effects,
      isAoE,
      aoeRadius,
      cooldown, // Include cooldown in the response
      classId
    });
  } catch (err) {
    console.error('Error saving spell:', err);
    res.status(500).json({ error: 'Error saving spell.', details: err.message });
  }
});

// Route to get all spells
router.get('/getSpells', async (req, res) => {
  try {
    const query = `
      SELECT id, name, damageType, diceType, spellRange, description, effects, isAoE, aoeRadius, cooldown
      FROM Spells;
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching spells' });
  }
});

module.exports = router;