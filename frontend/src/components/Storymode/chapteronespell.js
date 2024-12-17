import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './chapteronespell.css';
import abilityImage from '../spellImages/ability.png';
import radiantImage from '../spellImages/radiant.png';
import fireImage from '../spellImages/fire.png';
import coldImage from '../spellImages/cold.png';
import necroticImage from '../spellImages/necrotic.png';
import healingImage from '../spellImages/healing.png';
import acidImage from '../spellImages/acid.png';
import TileMapTwos from '../TileMap/TileMapTwos.js'; // Adjust the import path


const ChapterOneSpells = () => {
  const [character, setCharacter] = useState(null);
  const [classes, setClasses] = useState([]);
  const [races, setRaces] = useState([]);
  const [spells, setSpells] = useState([]);
  const [selectedSpells, setSelectedSpells] = useState({});
  
  const [team1, setTeam1] = useState([]);
  const [team2, setTeam2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [hoveredSpell, setHoveredSpell] = useState(null);

  
  const damageTypeImageMap = {
    ability: abilityImage,
    radiant: radiantImage,
    cold: coldImage,
    fire: fireImage,
    necrotic: necroticImage,
    heal: healingImage,
    acid: acidImage,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data concurrently
        const [classResponse, raceResponse, spellResponse, characterResponse] = await Promise.all([
          axios.get('http://localhost:5000/classes/getClasses'),
          axios.get('http://localhost:5000/races/getRaces'),
          axios.get('http://localhost:5000/spells/getSpells'),
          axios.get('http://localhost:5000/characters/getCharacters'),
        ]);
  
        // Set classes, races, and spells
        setClasses(classResponse.data);
        setRaces(raceResponse.data);
        setSpells(spellResponse.data);
  
        // Process characters
        const allCharacters = characterResponse.data;
  
        // Filter NPCs
        const npcs = allCharacters.filter((char) => char.isNpc);
       
  
        console.log('NPCs:', npcs); // Logs filtered NPCs
  
        // Get the selected character from local storage
        const selectedCharacter = JSON.parse(localStorage.getItem('selectedCharacter'));
        setCharacter(selectedCharacter);
  
        // Extract specific NPCs
        const Gorn = npcs.find((npc) => npc.name === 'Gorn');
        const Goblin = npcs.find((npc) => npc.name === 'Goblin'); // Only one Goblin
        const GoblinChief = npcs.find((npc) => npc.name === 'Goblin Chief');
        const GoblinCharger = npcs.find((npc) => npc.name === 'Goblin Charger');
  
        // Setup teams
        const team1Members = [selectedCharacter, Gorn].filter(Boolean).map((char) => ({
          ...char,
          team: 'gold',
          isNpc: char.isNpc || false, // Ensure isNpc is included
        }));
  
        const team2Members = [
          Goblin, // Only one Goblin
          GoblinChief,
          GoblinCharger,
        ]
          .filter(Boolean) // Remove any null or undefined NPCs
          .map((npc) => ({
            ...npc,
            team: 'green',
            isNpc: true, // Explicitly mark these as NPCs
          }));
  
        setTeam1(team1Members);
        setTeam2(team2Members);
  
        // Log the teams for debugging
        console.log('Team 1 (Gold):', team1Members);
        console.log('Team 2 (Green):', team2Members);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  
  
  
  const getClassById = (id) => classes.find((cls) => cls.id === id) || {};
  const getRaceById = (id) => races.find((race) => race.id === id) || {};


  
 
  const getMaxSelections = (className, level) => {
    if (!level) return 0;
    switch (className) {
      case 'Wizard':
        return level >= 3 ? 2 : 1;
      case 'Fighter':
      case 'Paladin':
        return level === 1 ? 0 : level >= 2 ? 1 : 0;
      default:
        return 0;
    }
  };

  const filterSpells = (character) => {
    if (!character) return [];
    const cls = getClassById(character.classId);
    switch (cls.name) {
      case 'Fighter':
        return spells.filter((spell) => spell.damageType === 'ability');
      case 'Paladin':
        return spells.filter(
          (spell) => ['ability', 'radiant', 'heal'].includes(spell.damageType)
        );
      case 'Wizard':
        return spells.filter(
          (spell) => !['ability', 'radiant', 'heal'].includes(spell.damageType)
        );
      default:
        return [];
    }
  };
  const handleSpellClick = (characterId, spellId) => {
    handleSpellToggle(characterId, spellId);  // Correctly pass both characterId and spellId
  };
  
  const handleSpellToggle = (characterId, spellId) => {
    const updatedSelectedSpells = { ...selectedSpells };
  
    // Initialize an array for the character if it doesn't already exist
    if (!updatedSelectedSpells[characterId]) {
      updatedSelectedSpells[characterId] = [];
    }
  
    // Toggle the selected spell for the character
    const spellIndex = updatedSelectedSpells[characterId].indexOf(spellId);
  
    if (spellIndex > -1) {
      // If the spell is already selected, remove it
      updatedSelectedSpells[characterId].splice(spellIndex, 1);
    } else if (updatedSelectedSpells[characterId].length < maxSelections) {
      // If the spell isn't selected, and we haven't reached the max limit, add it
      updatedSelectedSpells[characterId].push(spellId);
    }
  
    // Update the state with the modified selected spells
    setSelectedSpells(updatedSelectedSpells);
  };
  const combineAttributes = (character) => {
    if (!character) return null;
    const cls = getClassById(character.classId);
    const race = getRaceById(character.raceId);
    return {
      name: character.name,
      level: character.level,
      className: cls.name || 'Unknown',
      raceName: race.name || 'Unknown',
      attackBonus: (cls.attackBonus || 0) + (race.attackBonus || 0),
      attackPower: (cls.attackPower || 0) + (race.attackPower || 0),
      spellAttack: (cls.spellAttack || 0) + (race.spellAttack || 0),
      spellPower: (cls.spellPower || 0) + (race.spellPower || 0),
      health: (cls.baseHealth || 0) + (race.health || 0),
      armorClass: (cls.baseDefense || 0) + (race.armorClass || 0),
      speed: race.speed || 0,
    };
  };

  if (loading) return <p>Loading selected character...</p>;
  if (!character) return <p>No character selected.</p>;

  const combinedAttributes = combineAttributes(character);
  const availableSpells = filterSpells(character);
  const cls = getClassById(character.classId);
  const maxSelections = getMaxSelections(cls.name, character.level);

  const handleShowMap = () => setShowMap(true);
  const handleExitMap = () => setShowMap(false);



  return (
    <div className="wrapperAll">
      <h1 className="title">Choose Your Spells</h1>
  
      <div className="character-container">
        {/* Character Data */}
        <div className="character-data">
          <h2 className="character-name-spell">{combinedAttributes.name}</h2>
          <p>Class: <span className="attribute-value">{combinedAttributes.className}</span></p>
          <p>Race: <span className="attribute-value">{combinedAttributes.raceName}</span></p>
          <p>Level: <span className="attribute-value">{combinedAttributes.level}</span></p>
          <p>Attack Bonus: <span className="attribute-value">{combinedAttributes.attackBonus}</span></p>
          <p>Attack Power: <span className="attribute-value">{combinedAttributes.attackPower}</span></p>
          <p>Spell Attack: <span className="attribute-value">{combinedAttributes.spellAttack}</span></p>
          <p>Spell Power: <span className="attribute-value">{combinedAttributes.spellPower}</span></p>
          <p>Health: <span className="attribute-value">{combinedAttributes.health}</span></p>
          <p>Armor Class: <span className="attribute-value">{combinedAttributes.armorClass}</span></p>
          <p>Speed: <span className="attribute-value">{combinedAttributes.speed}</span></p>
  
       {/* Spell Slots */}
<div className="spell-slots">
  {Array.from({ length: maxSelections }).map((_, index) => {
    const selectedSpellId = selectedSpells[character.id]?.[index]; // Get the spell id for this slot index
    const selectedSpell = spells.find(spell => spell.id === selectedSpellId); // Find the spell based on the id

    return (
      <div
        key={index}
        className={`spell-slot ${selectedSpellId ? 'filled' : ''}`}
      >
        {selectedSpell && (
          <img
            src={damageTypeImageMap[selectedSpell.damageType] || ""}
            alt={selectedSpell.name}
          />
        )}
      </div>
    );
  })}
</div>
        </div>
  
      {/* Available Spells */}
<div className="available-spells">
  {availableSpells.map((spell) => (
    <div
      key={spell.id}
      className={`spell ${selectedSpells[character.id]?.includes(spell.id) ? 'selected' : ''}`}
      onClick={() => handleSpellClick(character.id, spell.id)}  // Pass characterId and spellId
      onMouseEnter={() => setHoveredSpell(spell)}
      onMouseLeave={() => setHoveredSpell(null)}
    >
      <img
        className="spell-icon"
        src={damageTypeImageMap[spell.damageType] || ""}
        alt={spell.name}
      />
      <p>{spell.name}</p>
      {hoveredSpell && hoveredSpell.id === spell.id && (
        <div className="spell-details">
          <p><strong>Damage Type:</strong> {hoveredSpell.damageType}</p>
          <p><strong>Description:</strong> {hoveredSpell.description}</p>
          <p><strong>Dice Type:</strong> {hoveredSpell.diceType}</p>
          <p><strong>Range:</strong> {hoveredSpell.spellRange}</p>
          <p><strong>Effect:</strong> {hoveredSpell.effects}</p>
        </div>
      )}
    </div>
  ))}
</div>

      </div>
  
      {/* TileMapTwos */}
      {showMap && (
        <TileMapTwos
          characters={[...team1, ...team2]} // Combined teams
          team1={team1} // Pass team1
          team2={team2} // Pass team2
          selectedSpells={selectedSpells} // Additional data
          onExit={handleExitMap}
        />
      )}
      <button onClick={handleShowMap}>Show Map</button>
    </div>
  );
  
}

export default ChapterOneSpells;
