import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './SpellAbilitySelection.css'; // Ensure the CSS is imported
import abilityImage from '../spellImages/ability.png';
import radiantImage from '../spellImages/radiant.png';
import fireImage from '../spellImages/fire.png';
import coldImage from '../spellImages/cold.png';
import necroticImage from '../spellImages/necrotic.png';
import healingImage from '../spellImages/healing.png';
import acidImage from '../spellImages/acid.png';

const SpellSelect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [spells, setSpells] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSpells, setSelectedSpells] = useState({});


  const damageTypeImageMap = {
    ability: abilityImage,
    radiant: radiantImage,
    cold: coldImage,
    fire: fireImage,
    necrotic: necroticImage,
    heal:healingImage,
    acid:acidImage
    // Add other damage types here
};
  // Memoized selected characters from location state
  const selectedChars = useMemo(() => {
    const chars = location.state?.selectedCharacters || [];
    console.log('Selected Characters (useMemo):', chars); // Log selected characters
    return chars;
  }, [location.state?.selectedCharacters]);

  useEffect(() => {
    const fetchSpells = async () => {
      console.log('Fetching spells...'); // Debug log before fetching spells
      try {
        const spellsResponse = await axios.get('http://localhost:5000/spells/getSpells');
        console.log('Fetched Spells:', spellsResponse.data); // Log fetched spells
        setSpells(spellsResponse.data);
      } catch (error) {
        console.error('Error fetching spells:', error);
      }
    };
  
    const fetchClasses = async () => {
      console.log('Fetching classes...'); // Debug log before fetching classes
      try {
        const classesResponse = await axios.get('http://localhost:5000/classes/getClasses');
        console.log('Fetched Classes:', classesResponse.data); // Log fetched classes
        setClasses(classesResponse.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
  
    fetchSpells();
    fetchClasses();
  }, []);

  const getClassNameById = (classId) => {
    const classObj = classes.find(cls => cls.id === classId);
    return classObj ? classObj.name : 'Unknown';
  };

  const filterSpells = (character) => {
    const className = getClassNameById(character.classId);
    if (!className) return [];
  
    switch (className) {
      case 'Fighter':
        return spells.filter(spell => spell.damageType === 'ability');
      case 'Paladin':
        // Paladins can choose one ability and one radiant or heal spell
        return spells.filter(spell => 
          spell.damageType === 'ability' || 
          spell.damageType === 'radiant' || 
          spell.damageType === 'heal'
        );
      case 'Wizard':
        return spells.filter(spell => 
          spell.damageType !== 'ability' && 
          spell.damageType !== 'radiant' && 
          spell.damageType !== 'heal'
        );
      default:
        return [];
    }
  };

  const getMaxSelections = (className) => {
    switch (className) {
      case 'Wizard':
        return { spells: 3, abilities: 0 };
      case 'Fighter':
        return { spells: 0, abilities: 2 };
      case 'Paladin':
        return { ability: 1, radiant: 1 }; // Updated to reflect one ability and one radiant/heal
      default:
        return { spells: 0, abilities: 0 };
    }
  };

  const handleSpellToggle = (charId, spellId) => {
    const charClass = getClassNameById(selectedChars.find(char => char.id === charId)?.classId || '');
    const maxSelections = getMaxSelections(charClass);

    setSelectedSpells(prevState => {
      const currentSpells = prevState[charId] || [];
      const spell = spells.find(s => s.id === spellId);
      const isSpellSelected = currentSpells.includes(spellId);
      const spellType = spell?.damageType;

      if (isSpellSelected) {
        return {
          ...prevState,
          [charId]: currentSpells.filter(id => id !== spellId)
        };
      } else {
        if (charClass === 'Fighter' && spellType === 'ability' && currentSpells.length < maxSelections.abilities) {
          return {
            ...prevState,
            [charId]: [...currentSpells, spellId]
          };
        } else if (charClass === 'Paladin') {
          const abilityCount = currentSpells.filter(id => spells.find(s => s.id === id)?.damageType === 'ability').length;
          const radiantCount = currentSpells.filter(id => spells.find(s => s.id === id)?.damageType === 'radiant' || spells.find(s => s.id === id)?.damageType === 'heal').length;

          if (spellType === 'ability' && abilityCount < maxSelections.ability) {
            return {
              ...prevState,
              [charId]: [...currentSpells, spellId]
            };
          } else if ((spellType === 'radiant' || spellType === 'heal') && radiantCount < maxSelections.radiant) {
            return {
              ...prevState,
              [charId]: [...currentSpells, spellId]
            };
          } else {
            alert(`Paladins can select up to 1 'ability' and 1 'radiant' or 'heal' spell.`);
            return prevState;
          }
        } else if (charClass === 'Wizard' && currentSpells.length < maxSelections.spells) {
          return {
            ...prevState,
            [charId]: [...currentSpells, spellId]
          };
        } else {
          alert(`You can only select ${maxSelections.spells || maxSelections.abilities} spells.`);
          return prevState;
        }
      }
    });
  };

  const handleSubmit = () => {
    console.log('Navigating with:', { selectedChars, selectedSpells }); // Log data before navigation
    navigate('/tile-map', { state: { selectedChars, selectedSpells } });
  };

  return (
    <div className="spell-select">
      {selectedChars.length > 0 && (
        <>
          <div className="spell-select__battle-button">
            <button onClick={handleSubmit}>Start Battle</button>
          </div>
          <div className="spell-select__row">
            {selectedChars.map((char) => (
              <div key={char.id} className="spell-select__char-card">
                <h3>{char.name}</h3>
                <p><strong>Class:</strong> {getClassNameById(char.classId)}</p>
           

                <div className="spell-select__spells">
                  <h4>Selected Spells</h4>
                  {selectedSpells[char.id]?.map(spellId => {
                    const spell = spells.find(s => s.id === spellId);
                    return spell ? (
                      <div key={spell.id} className="spell-select__spell-item">
                        {spell.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="spell-select__row">
            {selectedChars.map((char) => (
              <div key={char.id} className="spell-select__char-card">
              {filterSpells(char).map((spell) => (
  <div
    key={spell.id}
    className={`spell-select__spell-card ${spell.damageType}`}
    onClick={() => handleSpellToggle(char.id, spell.id)}
  >
    <p className="spell-name">{spell.name}</p>
    <div className="spell-details">
      <img 
        src={damageTypeImageMap[spell.damageType]} 
        alt={spell.damageType} 
        className="spell-image"
      /> {/* Add the image here */}
      <p><strong>Damage Type:</strong> {spell.damageType}</p>
      <p><strong>Description:</strong> {spell.description}</p>
      <p><strong>Dice Type:</strong> {spell.diceType}</p> {/* Ensure diceType is visible */}
      <p><strong>Range:</strong> {spell.spellRange}</p>
      <p><strong>Effect:</strong> {spell.effects}</p>
    </div>
  </div>
))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SpellSelect;
