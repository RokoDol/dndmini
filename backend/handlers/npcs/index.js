const express = require('express');
const router = express.Router();
const db = require('../../db');

// Save NPC
router.post('/saveNpc', async (req, res) => {
    const {
        name,
        npcType,
        attackBonus,
        attackPower,
        spellAttack,
        spellPower,
        health,
        armorClass,
        speed,
        level,
        weapon,
        spells
    } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO NPCs 
            (name, npcType, attackBonus, attackPower, spellAttack, spellPower, health, armorClass, speed, level, weaponId, spellIds)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                npcName,
                npcType,
                attackBonus,
                attackPower,
                spellAttack,
                spellPower,
                health,
                armorClass,
                speed,
                level,
                weapon || null,
                JSON.stringify(spells)
            ]
        );
        res.status(201).json({ message: 'NPC saved successfully', npcId: result.insertId });
    } catch (error) {
        console.error('Error saving NPC:', error);
        res.status(500).json({ error: 'Error saving NPC' });
    }
});

// Get NPCs
router.get('/getNpcs', async (req, res) => {
    try {
        const [npcs] = await db.query(`SELECT * FROM NPCs`);
        res.json(npcs);
    } catch (error) {
        console.error('Error fetching NPCs:', error);
        res.status(500).json({ error: 'Error fetching NPCs' });
    }
});

module.exports = router;
