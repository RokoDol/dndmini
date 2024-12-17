import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './createList.css';

function CharacterList() {
  const [characters, setCharacters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [races, setRaces] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch characters
        const characterResponse = await axios.get('http://localhost:5000/characters/getCharacters');
        setCharacters(characterResponse.data);

        // Fetch classes
        const classResponse = await axios.get('http://localhost:5000/classes/getClasses');
        setClasses(classResponse.data);

        // Fetch races
        const raceResponse = await axios.get('http://localhost:5000/races/getRaces');
        setRaces(raceResponse.data);

        // Fetch items
        const itemResponse = await axios.get('http://localhost:5000/items/getItems');
        setItems(itemResponse.data);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data.');
      }
    };

    fetchData();
  }, []);

  const getClassNameById = (id) => {
    const cls = classes.find((cls) => cls.id === id);
    return cls ? cls.name : 'Unknown';
  };

  const getRaceById = (id) => {
    const race = races.find((race) => race.id === id);
    return race || {
      name: 'Unknown',
      attackBonus: 0,
      attackPower: 0,
      spellAttack: 0,
      spellPower: 0,
      health: 0,
      armorClass: 0,
      speed: 0, // Default value for speed
    };
  };

  const getClassById = (id) => {
    const cls = classes.find((cls) => cls.id === id);
    return cls || {
      attackBonus: 0,
      attackPower: 0,
      spellAttack: 0,
      spellPower: 0,
      baseHealth: 0,
      baseDefense: 0,
    };
  };

  const getItemNameById = (itemId) => {
    const item = items.find((item) => item.id === itemId);
    return item ? item.name : 'Unknown';
  };

  const combineAttributes = (character) => {
    const race = getRaceById(character.raceId);
    const cls = getClassById(character.classId);
  
    // Assuming level is calculated based on combined attributes or provided by the backend
    const level = character.level || Math.floor(((cls.attackBonus || 0) + (race.attackBonus || 0)) / 10) || 1;
  
    return {
      name: race.name,
      attackBonus: (cls.attackBonus || 0) + (race.attackBonus || 0),
      attackPower: (cls.attackPower || 0) + (race.attackPower || 0),
      spellAttack: (cls.spellAttack || 0) + (race.spellAttack || 0),
      spellPower: (cls.spellPower || 0) + (race.spellPower || 0),
      health: (cls.health || 0) + (race.health || 0),
      armorClass: (cls.armorClass || 0) + (race.armorClass || 0),
      speed: race.speed || 0, // Include speed from the race
      level, // Add level to combined attributes
    };
  };
  
  return (
    <div className="character-list-container">
      <h2 className="character-list-title">Character List</h2>
      {error && <p className="character-list-error">{error}</p>}
      <div className="character-list-grid">
        {characters.length > 0 ? (
          characters.map((character) => {
            const combined = combineAttributes(character);
            return (
              <div className="character-list-item" key={character.id}>
                <h2>{character.name}</h2>
                <div><strong>Class:</strong> {getClassNameById(character.classId)}</div>
                <div><strong>Race:</strong> {combined.name}</div>
                <div><strong>Level:</strong> {combined.level}</div> {/* Display level */}
                <div><strong>Attack Bonus:</strong> {combined.attackBonus}</div>
                <div><strong>Attack Power:</strong> {combined.attackPower}</div>
                <div><strong>Spell Attack:</strong> {combined.spellAttack}</div>
                <div><strong>Spell Power:</strong> {combined.spellPower}</div>
                <div><strong>Health:</strong> {combined.health}</div>
                <div><strong>Armor Class:</strong> {combined.armorClass}</div>
                <div><strong>Speed:</strong> {combined.speed}</div> {/* Display speed */}
                <div><strong>Weapon:</strong> {getItemNameById(character.weaponId)}</div>
                <div><strong>Shield:</strong> {getItemNameById(character.shieldId)}</div>
              </div>
            );
          })
        ) : (
          <p className="character-list-error">No characters available.</p>
        )}
      </div>
    </div>
  );
}

export default CharacterList;
