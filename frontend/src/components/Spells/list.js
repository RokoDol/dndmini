import React, { useEffect, useState } from 'react';
import { fetchSpells } from './api'; // Adjust the path as needed
import './SpellList.css'; // Adjust the path as needed

const SpellList = () => {
  const [spells, setSpells] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSpells = async () => {
      try {
        const spellsData = await fetchSpells();
        console.log('Fetched spells data:', spellsData); // Log the fetched data
        setSpells(spellsData);
      } catch (error) {
        setError('Failed to fetch spells');
      }
    };

    getSpells();
  }, []);

  return (
    <div className="spell-list-container">
      <h2>Spell List</h2>
      {error && <p>{error}</p>}
      <ul>
        {spells.map(spell => (
          <li key={spell.id}>
            <strong>{spell.name}</strong>
            <p>Damage Type: {spell.damageType}</p>
            <p>Dice Type: {spell.diceType}</p>
            <p>Range: {spell.spellRange}</p>
            <p>Description: {spell.description}</p>
            <p>Cooldown: {spell.cooldown}</p>
            
            {/* Check and display effects properly */}
            {spell.effects && spell.effects !== '""' && spell.effects.trim() !== "" ? (
              <p>Effects: {spell.effects}</p>
            ) : (
              <p>No effects available</p>
            )}

            {/* Display class names */}
            {spell.classNames && (
              <p>Classes: {spell.classNames.split(',').join(', ')}</p>
            )}

            {/* Display AoE fields */}
            {spell.isAoE ? (
              <p>AoE Radius: {spell.aoeRadius}</p>
            ) : (
              <p>This spell is not an AoE spell</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SpellList;
