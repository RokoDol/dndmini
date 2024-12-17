const express = require('express');
const router = express.Router();
const db = require('../../db'); // Adjust path if necessary

// Route for saving a character
router.post('/saveCharacter', async (req, res) => {
  const { name, classId, raceId, weaponId, shieldId, level } = req.body;
  
    // Basic validation
    if (!name || !classId || !raceId || level === undefined) {
      return res.status(400).json({ error: 'Name, classId, raceId, and level are required.' });
  }

  try {
    const query = `
        INSERT INTO Characters (name, classId, raceId, weaponId, shieldId, level)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
      console.log('Executing query:', query);
      console.log('With parameters:', [name, classId, raceId, weaponId, shieldId]);
      
      const [result] = await db.execute(query, [name, classId, raceId, weaponId, shieldId, level]);
      res.status(201).json({ message: 'Character saved successfully!', id: result.insertId });
  } catch (error) {
      console.error('Error saving character:', error);
      res.status(500).json({ error: 'Error saving character.' });
    }
  });

module.exports = router;
