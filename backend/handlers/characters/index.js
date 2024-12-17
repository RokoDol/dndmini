const express = require('express');
const router = express.Router();
const db = require('../../db'); // Import the database connection

// Route for saving a character
router.post('/saveCharacter', async (req, res) => {
  const { name, classId, raceId, weaponId, shieldId, isNpc = false, spellIds = null } = req.body;

  // Default undefined parameters to null
  const weaponIdOrNull = weaponId !== undefined ? weaponId : null;
  const shieldIdOrNull = shieldId !== undefined ? shieldId : null;

  try {
    const query = `
      INSERT INTO Characters (name, classId, raceId, weaponId, shieldId, isNpc, spellIds)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      name,
      classId,
      raceId,
      weaponIdOrNull,
      shieldIdOrNull,
      isNpc,
      spellIds ? JSON.stringify(spellIds) : null,
    ]);
    res.status(201).json({
      id: result.insertId,
      name,
      classId,
      raceId,
      weaponId: weaponIdOrNull,
      shieldId: shieldIdOrNull,
      isNpc,
      spellIds,
    });
  } catch (error) {
    console.error('Error saving character:', error);
    res.status(500).json({ error: 'Error saving character.' });
  }
});

// Route for fetching characters
router.get('/getCharacters', async (req, res) => {
  try {
    const query = 'SELECT * FROM Characters'; // Ensure this includes raceId
    const [rows] = await db.execute(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Error fetching characters.' });
  }
});

module.exports = router;
