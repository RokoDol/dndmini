import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './singleplayercharacter.css'; // Add custom styles for selection highlighting
import { useNavigate } from 'react-router-dom';

function SinglePlayerCharacter() {

  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [races, setRaces] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null); // Track selected character

  useEffect(() => {
    const fetchData = async () => {
      try {
        const characterResponse = await axios.get('http://localhost:5000/characters/getCharacters');
        setCharacters(characterResponse.data);

        const classResponse = await axios.get('http://localhost:5000/classes/getClasses');
        setClasses(classResponse.data);

        const raceResponse = await axios.get('http://localhost:5000/races/getRaces');
        setRaces(raceResponse.data);

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
      speed: 0,
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

    const level = character.level || Math.floor(((cls.attackBonus || 0) + (race.attackBonus || 0)) / 10) || 1;

    return {
      name: race.name,
      attackBonus: (cls.attackBonus || 0) + (race.attackBonus || 0),
      attackPower: (cls.attackPower || 0) + (race.attackPower || 0),
      spellAttack: (cls.spellAttack || 0) + (race.spellAttack || 0),
      spellPower: (cls.spellPower || 0) + (race.spellPower || 0),
      health: (cls.health || 0) + (race.health || 0),
      armorClass: (cls.armorClass || 0) + (race.armorClass || 0),
      speed: race.speed || 0,
      level,
    };
  };

  const handleCharacterSelection = (id) => {
    setSelectedCharacterId(id);
  
    // Save the selected character to localStorage
    const selectedCharacter = characters.find((character) => character.id === id);
    localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
  };
const handleChapterSelection = () => {
  navigate ("/select-chapter")
}
 
  return (
    <div className="single-player-character-container">
      <h2 className="single-player-character-title">Select Your Character</h2>
      {error && <p className="single-player-character-error">{error}</p>}
      <div className="single-player-character-grid">
      <button onClick={handleChapterSelection}>Play</button>
        {characters.length > 0 ? (
          characters.map((character) => {
            const combined = combineAttributes(character);
            const isSelected = character.id === selectedCharacterId;
          
            return (
              
              <div
                key={character.id}
                className={`single-player-character-item ${isSelected ? 'single-player-character-item-selected' : ''}`} // Add 'selected' class if this character is selected
                onClick={() => handleCharacterSelection(character.id)} // Handle selection
              >
                <h2 className="single-player-character-item-title">{character.name}</h2>
                <div className="single-player-character-item-class"><strong>Class:</strong> {getClassNameById(character.classId)}</div>
                <div className="single-player-character-item-race"><strong>Race:</strong> {combined.name}</div>
                <div className="single-player-character-item-level"><strong>Level:</strong> {combined.level}</div>
                <div className="single-player-character-item-attack-bonus"><strong>Attack Bonus:</strong> {combined.attackBonus}</div>
                <div className="single-player-character-item-attack-power"><strong>Attack Power:</strong> {combined.attackPower}</div>
                <div className="single-player-character-item-spell-attack"><strong>Spell Attack:</strong> {combined.spellAttack}</div>
                <div className="single-player-character-item-spell-power"><strong>Spell Power:</strong> {combined.spellPower}</div>
                <div className="single-player-character-item-health"><strong>Health:</strong> {combined.health}</div>
                <div className="single-player-character-item-armor-class"><strong>Armor Class:</strong> {combined.armorClass}</div>
                <div className="single-player-character-item-speed"><strong>Speed:</strong> {combined.speed}</div>
                <div className="single-player-character-item-weapon"><strong>Weapon:</strong> {getItemNameById(character.weaponId)}</div>
                <div className="single-player-character-item-shield"><strong>Shield:</strong> {getItemNameById(character.shieldId)}</div>
              
              </div>
           
            );
          })
          
        ) : (
          <p className="single-player-character-error">No characters available.</p>
        )}
      </div>
    </div>
  );
}

export default SinglePlayerCharacter;
