import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './TwoSpellAbilitySelection.css'; // Ensure the CSS is imported
import abilityImage from '../spellImages/ability.png';
import radiantImage from '../spellImages/radiant.png';
import fireImage from '../spellImages/fire.png';
import coldImage from '../spellImages/cold.png';
import necroticImage from '../spellImages/necrotic.png';
import healingImage from '../spellImages/healing.png';
import acidImage from '../spellImages/acid.png';
import TileMapTwos from '../TileMap/TileMapTwos'; // Import TileMapTwos component
import fighterToken from '../tokeni/fighterToken.png';
import wizardToken from '../tokeni/wizardToken.png';
import paladinToken from '../tokeni/paladinToken.png';


const TwoSpellAbilitySelection = ({ team1, team2 }) => {

  const location = useLocation();
  const [spells, setSpells] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSpells, setSelectedSpells] = useState({});
  const [showMap, setShowMap] = useState(false); // For showing the map

  const damageTypeImageMap = {
    ability: abilityImage,
    radiant: radiantImage,
    cold: coldImage,
    fire: fireImage,
    necrotic: necroticImage,
    heal: healingImage,
    acid: acidImage,
  };


  const classImageMap = {
    fighter: fighterToken,
    wizard: wizardToken,
    paladin: paladinToken,
    // Add other class mappings as needed
  };
  const selectedChars = useMemo(() => {
    return location.state?.selectedCharacters || [];
  }, [location.state?.selectedCharacters]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spellsResponse, classesResponse] = await Promise.all([
          axios.get('http://localhost:5000/spells/getSpells'),
          axios.get('http://localhost:5000/classes/getClasses'),
        ]);
        setSpells(spellsResponse.data);
        setClasses(classesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const getClassNameById = (classId) => {
    const classObj = classes.find((cls) => cls.id === classId);
    return classObj ? classObj.name : 'Unknown';
  };

  const filterSpells = (character) => {
    const className = getClassNameById(character.classId);
    if (!className) return [];

    switch (className) {
      case 'Fighter':
        return spells.filter((spell) => spell.damageType === 'ability');
      case 'Paladin':
        return spells.filter(
          (spell) =>
            spell.damageType === 'ability' ||
            spell.damageType === 'radiant' ||
            spell.damageType === 'heal'
        );
      case 'Wizard':
        return spells.filter(
          (spell) =>
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
        return { ability: 1, radiant: 1 }; // One ability and one radiant/heal
      default:
        return { spells: 0, abilities: 0 };
    }
  };

  const handleSpellToggle = (charId, spellId) => {
    const charClass = getClassNameById(
      selectedChars.find((char) => char.id === charId)?.classId || ''
    );
    const maxSelections = getMaxSelections(charClass);

    setSelectedSpells((prevState) => {
      const currentSpells = prevState[charId] || [];
      const spell = spells.find((s) => s.id === spellId);
      const isSpellSelected = currentSpells.includes(spellId);
      const spellType = spell?.damageType;

      if (isSpellSelected) {
        return {
          ...prevState,
          [charId]: currentSpells.filter((id) => id !== spellId),
        };
      } else {
        if (
          charClass === 'Fighter' &&
          spellType === 'ability' &&
          currentSpells.length < maxSelections.abilities
        ) {
          return {
            ...prevState,
            [charId]: [...currentSpells, spellId],
          };
        } else if (charClass === 'Paladin') {
          const abilityCount = currentSpells.filter(
            (id) => spells.find((s) => s.id === id)?.damageType === 'ability'
          ).length;
          const radiantCount = currentSpells.filter(
            (id) =>
              spells.find((s) => s.id === id)?.damageType === 'radiant' ||
              spells.find((s) => s.id === id)?.damageType === 'heal'
          ).length;

          if (spellType === 'ability' && abilityCount < maxSelections.ability) {
            return {
              ...prevState,
              [charId]: [...currentSpells, spellId],
            };
          } else if (
            (spellType === 'radiant' || spellType === 'heal') &&
            radiantCount < maxSelections.radiant
          ) {
            return {
              ...prevState,
              [charId]: [...currentSpells, spellId],
            };
          } else {
            alert(
              `Paladins can select up to 1 'ability' and 1 'radiant' or 'heal' spell.`
            );
            return prevState;
          }
        } else if (charClass === 'Wizard' && currentSpells.length < maxSelections.spells) {
          return {
            ...prevState,
            [charId]: [...currentSpells, spellId],
          };
        } else {
          alert(`You can only select ${maxSelections.spells || maxSelections.abilities} spells.`);
          return prevState;
        }
      }
    });
  };

  // Handle map visibility
  const handleShowMap = () => {
    setShowMap(true);
  };

  // Handle exit from full-screen map
  const handleExitMap = () => {
    setShowMap(false);
  };

  return (
    <div className="two-spell-select">
      {selectedChars.length > 0 && !showMap && (
        <>
          {/* Existing spell selection UI */}
          <div className="two-spell-select__row">
            {selectedChars.map((char) => {
              const className = getClassNameById(char.classId); // Get the class name
              return (
                <div key={char.id} className="two-spell-select__char-card">
                  <h3>{char.name}</h3>
                  <p>
                    <strong>Class:</strong> {className}
                  </p>
                  {/* Display class image */}
                  {classImageMap[className.toLowerCase()] && (
                    <img
                      src={classImageMap[className.toLowerCase()]} // Use class name in lower case for mapping
                      alt={className}
                      className="two-spell-select__class-image" // Add a class for styling
                    />
                  )}
                  <div className="two-spell-select__spells">
                    <h4>Selected Spells</h4>
                    {selectedSpells[char.id]?.map((spellId) => {
                      const spell = spells.find((s) => s.id === spellId);
                      return spell ? (
                        <div key={spell.id} className="two-spell-select__spell-item">
                          {spell.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Continue with the rest of your code */}
          <div className="two-spell-select__row">
            {selectedChars.map((char) => (
              <div key={char.id} className="two-spell-select__char-card">
                {filterSpells(char).map((spell) => (
                  <div
                    key={spell.id}
                    className={`two-spell-select__spell-card ${spell.damageType}`}
                    onClick={() => handleSpellToggle(char.id, spell.id)}
                  >
                    <p className="two-spell-select__spell-name">{spell.name}</p>
                    <div className="two-spell-select__spell-details">
                      <img
                        src={damageTypeImageMap[spell.damageType]}
                        alt={spell.damageType}
                        className="two-spell-select__spell-image"
                      />
                      <p><strong>Damage Type:</strong> {spell.damageType}</p>
                      <p><strong>Description:</strong> {spell.description}</p>
                      <p><strong>Dice Type:</strong> {spell.diceType}</p>
                      <p><strong>Range:</strong> {spell.spellRange}</p>
                      <p><strong>Effect:</strong> {spell.effects}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
  
          <button
            className="two-spell-select__battle-button"
            onClick={() => {
              handleShowMap(); // Show the TileMapTwos component
              document.documentElement.requestFullscreen?.(); // Trigger fullscreen
            }}
          >
            Go to Battle Map
          </button>
        </>
      )}
  
  {showMap && (
    <TileMapTwos
      selectedSpells={selectedSpells}
      characters={selectedChars}
      team1={team1} // Pass team1
      team2={team2} // Pass team2
     
      onExit={handleExitMap}
    />
)}
    </div>
  );
  
};

export default TwoSpellAbilitySelection;
