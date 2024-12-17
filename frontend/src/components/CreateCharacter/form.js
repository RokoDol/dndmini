import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './createCharacter.css';

// Import spell images
import abilityImage from '../spellImages/ability.png';
import radiantImage from '../spellImages/radiant.png';
import fireImage from '../spellImages/fire.png';
import coldImage from '../spellImages/cold.png';
import necroticImage from '../spellImages/necrotic.png';
import healingImage from '../spellImages/healing.png';
import acidImage from '../spellImages/acid.png';

// Map damage types to images
const damageTypeImageMap = {
  ability: abilityImage,
  radiant: radiantImage,
  cold: coldImage,
  fire: fireImage,
  necrotic: necroticImage,
  heal: healingImage,
  acid: acidImage,
};

function CreateCharacterForm() {
  const [classes, setClasses] = useState([]);
  const [races, setRaces] = useState([]);
  const [items, setItems] = useState([]);
  const [spells, setSpells] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedRace, setSelectedRace] = useState('');
  const [selectedWeapon, setSelectedWeapon] = useState('');
  const [selectedShield, setSelectedShield] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [level, setLevel] = useState(1);
  const [isNpc, setIsNpc] = useState(false); // New state for NPC option
  const [selectedSpell, setSelectedSpell] = useState(null); // New state for holding the selected spell
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classResponse, raceResponse, itemResponse] = await Promise.all([
          axios.get('http://localhost:5000/classes/getClasses'),
          axios.get('http://localhost:5000/races/getRaces'),
          axios.get('http://localhost:5000/items/getItems'),
        ]);

        setClasses(classResponse.data);
        setRaces(raceResponse.data);
        setItems(itemResponse.data);
      } catch (error) {
        setError('Error fetching data.');
      }
    };

    fetchData();
  }, []);

  
  useEffect(() => {
    // Fetch spells only when isNpc is true
    if (isNpc) {
      axios
        .get('http://localhost:5000/spells/getSpells')
        .then((response) => setSpells(response.data))
        .catch(() => setError('Error fetching spells.'));
    } else {
      setSpells([]); // Clear spells if NPC is toggled off
    }
  }, [isNpc]);

  const handleSpellClick = (spell) => {
    // If the spell is already selected and locked, unlock it
    if (selectedSpell?.id === spell.id) {
      setSelectedSpell(null);
    } else if (!selectedSpell) {
      // If no spell is selected, lock this spell to the slot
      setSelectedSpell(spell);
    }
    // If another spell is clicked and the current spell is locked, do nothing
  };



  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:5000/characters/saveCharacter', {
        name: characterName,
        level,
        classId: selectedClass,
        raceId: selectedRace,
        weaponId: selectedWeapon || null,
        shieldId: selectedShield || null,
        isNpc,
      });
      alert('Character created successfully!');
      setCharacterName('');
      setLevel(1);
      setSelectedClass('');
      setSelectedRace('');
      setSelectedWeapon('');
      setSelectedShield('');
    } catch (error) {
      setError('Error creating character.');
    }
  };

  return (
    <div className="create-character-form-container">
      <h1 className="create-character-form-title">Create Character</h1>
      {error && <p className="create-character-form-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            required
          />
        </div>
        <div className='allSpellsContainer'>
  {/* Compact NPC checkbox */}
  <div className="npc-checkbox-container">
    <label>Is NPC:</label>
    <input 
      type="checkbox" 
      checked={isNpc} 
      onChange={(e) => setIsNpc(e.target.checked)} 
    />
  </div>

  {/* NPC spells container, show only if isNpc is true */}
  {isNpc && (
  <div className="npc-spells-container">
    <h3 className="npc-spells-title">Available Spells</h3>
    <div className="npc-spells-list">
      {spells.map((spell) => (
        <div
          key={spell.id}
          className={`npc-spell-item npc-spell-item-${spell.id} ${
            selectedSpell?.id === spell.id ? 'selected' : ''
          }`}
          onClick={() => handleSpellClick(spell)}
        >
          <img
            className={`npc-spell-icon npc-spell-icon-${spell.id}`}
            src={damageTypeImageMap[spell.damageType] || ''}
            alt={spell.name}
          />
          <p className={`npc-spell-name npc-spell-name-${spell.id}`}>{spell.name}</p>
        </div>
      ))}
    </div>
  </div>
)}

  {/* Display the selected spell */}
  {selectedSpell && (
    <div className="spell-slot-container">
      <h4>Spell Slot</h4>
      <div className="spell-slot">
        <img 
          src={damageTypeImageMap[selectedSpell.damageType]} 
          alt={selectedSpell.name} 
        />
      </div>
    </div>
  )}
</div>
        <div>
          <label>Level:</label>
          <input
            type="number"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            min="1"
            required
          />
        </div>
        <div>
          <label>Class:</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required>
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Race:</label>
          <select value={selectedRace} onChange={(e) => setSelectedRace(e.target.value)} required>
            <option value="">Select Race</option>
            {races.map((race) => (
              <option key={race.id} value={race.id}>
                {race.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Weapon:</label>
          <select value={selectedWeapon} onChange={(e) => setSelectedWeapon(e.target.value)}>
            <option value="">Select Weapon</option>
            {items.filter((item) => item.type === 'weapon').map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Shield:</label>
          <select value={selectedShield} onChange={(e) => setSelectedShield(e.target.value)}>
            <option value="">Select Shield</option>
            {items.filter((item) => item.type === 'shield').map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        
      
        <button type="submit">Create Character</button>
        <div className="view-all-characters-container">
          <button
            className="view-all-characters-button"
            type="button"
            onClick={() => navigate('/character-list')}
          >
            View All Characters
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCharacterForm;
