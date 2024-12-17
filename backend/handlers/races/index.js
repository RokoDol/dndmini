// backend/handlers/Race.js
const express = require('express');
const router = express.Router();
const db = require('../../db');

router.post('/saveRace', async (req, res) => {
  const { raceName, attackBonus, attackPower, spellAttack, spellPower, health, armorClass, speed } = req.body; // Added speed

  if (
    raceName === undefined ||
    attackBonus === undefined ||
    attackPower === undefined ||
    spellAttack === undefined ||
    spellPower === undefined ||
    health === undefined ||
    armorClass === undefined ||
    speed === undefined // Added speed validation
  ) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const query = `INSERT INTO Races (name, attackBonus, attackPower, spellAttack, spellPower, health, armorClass, speed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`; // Updated query
    await db.execute(query, [raceName, attackBonus, attackPower, spellAttack, spellPower, health, armorClass, speed]); // Added speed
    res.status(201).json({ message: 'Race saved successfully!' });
  } catch (error) {
    console.error('Error saving race:', error);
    res.status(500).json({ error: 'Error saving race.' });
  }
});

router.get('/getRaces', async (req, res) => {
  try {
    const query = 'SELECT * FROM Races'; // Ensure the SELECT includes Speed
    const [rows] = await db.execute(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching races:', error);
    res.status(500).json({ error: 'Error fetching races.' });
  }
});

module.exports = router;
