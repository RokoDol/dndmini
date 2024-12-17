import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './TileMap.css';
import { mapData } from '../Maps/maps.js'; // Adjust the path as necessary
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import {faClock, faSkullCrossbones } from '@fortawesome/free-solid-svg-icons'; // Add faClock here
import {
  addSlashEffect,
  createBloodParticles,
  createSparkles,
  addUnhealEffect,
  createGoldenSparkles,
  addSlowEffect,
  createAcidBubbles
} from './Animations.js'; 
import attackIcon from '../tokeni/attack.png'
import abilityImage from '../spellImages/ability.png';
import radiantImage from '../spellImages/radiant.png';
import fireImage from '../spellImages/fire.png';
import coldImage from '../spellImages/cold.png';
import necroticImage from '../spellImages/necrotic.png';
import healingImage from '../spellImages/healing.png';
import acidImage from '../spellImages/acid.png';



const gridSize = 12; // Set the number of columns to 20
const tileFeet = 5;

const TileMap = () => {

  const location = useLocation();
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [races, setRaces] = useState([]);
  const [items, setItems] = useState([]);
  const [tokenPositions, setTokenPositions] = useState({ red: 0, blue: gridSize * gridSize - 1 });
  const [currentMovingToken, setCurrentMovingToken] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [movedDistance, setMovedDistance] = useState({ red: 0, blue: 0 });
  const [flipDone, setFlipDone] = useState(false);
  const [hasAttacked, setHasAttacked] = useState({ red: false, blue: false });
  const [spells, setSpells] = useState([]);
  const [selectedSpells, setSelectedSpells] = useState([]);
  const [hasEndedTurn, setHasEndedTurn] = useState({ red: false, blue: false });
  const [roundCounter, setRoundCounter] = useState(1);
  const [unhealEffects, setUnhealEffects] = useState({});
  const [slowEffects, setSlowEffects] = useState({});
  const [movementSpellActive, setMovementSpellActive] = useState(false);
  const [acidDamageEffects, setAcidDamageEffects] = useState({});
 
  

  
  
 const currentCharacter = selectedCharacters.find((char, idx) => currentTurn === (idx === 0 ? 'red' : 'blue'));


 
 const isWall = (index) => {
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  return mapData?.walls.some(wall => wall.x === col && wall.y === row);
};
const isDiagonalValid = (row1, col1, row2, col2) => {
  // If moving diagonally, ensure both adjacent horizontal and vertical tiles are free of walls
  const horizontalWall = isWall(row1, col2);
  const verticalWall = isWall(row2, col1);
  return !(horizontalWall || verticalWall);
};



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
        const [classResponse, raceResponse, itemResponse, spellResponse] = await Promise.all([
          axios.get('http://localhost:5000/classes/getClasses'),
          axios.get('http://localhost:5000/races/getRaces'),
          axios.get('http://localhost:5000/items/getItems'),
          axios.get('http://localhost:5000/spells/getSpells'),
        ]);
        setClasses(classResponse.data);
        setRaces(raceResponse.data);
        setItems(itemResponse.data);
        setSpells(spellResponse.data);
  
        if (location.state?.selectedChars) {
          setSelectedCharacters(location.state.selectedChars);
          setTokenPositions({
            red: location.state.selectedChars[0]?.position || 0,
            blue: location.state.selectedChars[1]?.position || gridSize * gridSize - 1,
          });
        }
  
        // Map selected spells to character IDs
        if (location.state?.selectedSpells) {
          const mappedSpells = location.state.selectedSpells;
          setSelectedSpells(mappedSpells); // Store selected spells
        } else {
          console.log('No selected spells found.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [location.state]);


  const getClassNameById = (id) => classes.find((cls) => cls.id === id)?.name || 'Unknown';
  const getRaceById = (id) => races.find((race) => race.id === id) || { name: 'Unknown', speed: 0 };
  const getClassById = (id) => classes.find((cls) => cls.id === id) || { attackBonus: 0, attackPower: 0 };
  const getWeaponById = (id) => {
    const weapon = items.find((item) => item.id === id);
    return weapon ? weapon : { diceType: 'd6', attackPower: 0 };
  };
  
  const combineAttributes = (character) => {
    if (!character) {
      return { 
        name: 'Unknown', attackBonus: 0, attackPower: 0, spellAttack: 0, spellPower: 0, health: 0, armorClass: 0, speed: 0, spells: [] 
      };
    }
  
    const race = getRaceById(character.raceId);
    const cls = getClassById(character.classId);
    
    // Retrieve the selected spells for this character using character.id
    const characterSelectedSpells = selectedSpells[character.id] || [];
    const characterSpells = spells.filter(spell => characterSelectedSpells.includes(spell.id));
  
   
  
    return {
      name: character.name || 'Unknown',
      attackBonus: (cls?.attackBonus || 0) + (race?.attackBonus || 0),
      attackPower: (cls?.attackPower || 0) + (race?.attackPower || 0),
      spellAttack: (cls?.spellAttack || 0) + (race?.spellAttack || 0),
      spellPower: (cls?.spellPower || 0) + (race?.spellPower || 0),
      health: (character.health !== undefined ? character.health : (cls?.health || 0) + (race?.health || 0)),
      armorClass: (cls?.armorClass || 0) + (race?.armorClass || 0),
      speed: race?.speed || 0,
      spells: characterSpells, // Add spells to the combined attributes
      maxHealth: (cls?.health || 0) + (race?.health || 0),
    };
  };
  

  const findPath = (start, end) => {
    const queue = [[start]];
    const visited = new Set();
    const directions = [
        [-1, 0], // up
        [1, 0],  // down
        [0, -1], // left
        [0, 1],  // right
        [-1, -1], // up-left diagonal
        [-1, 1],  // up-right diagonal
        [1, -1],  // down-left diagonal
        [1, 1],   // down-right diagonal
    ];

    while (queue.length > 0) {
        const path = queue.shift();
        const [currentRow, currentCol] = path[path.length - 1];

        if (currentRow === end[0] && currentCol === end[1]) {
            return path.map(([row, col]) => row * gridSize + col);
        }

        for (const [dRow, dCol] of directions) {
            const newRow = currentRow + dRow;
            const newCol = currentCol + dCol;

            if (
                newRow >= 0 &&
                newRow < gridSize &&
                newCol >= 0 &&
                newCol < gridSize &&
                !isWall(newRow * gridSize + newCol) &&
                !visited.has(`${newRow},${newCol}`)
            ) {
                // Check if moving diagonally is valid
                if (Math.abs(dRow) + Math.abs(dCol) === 2 && !isDiagonalValid(currentRow, currentCol, newRow, newCol)) {
                    continue; // Invalid diagonal move
                }

                visited.add(`${newRow},${newCol}`);
                queue.push([...path, [newRow, newCol]]);
            }
        }
    }

    return null; // No path found
};


  const hasLineOfSight = (startPos, endPos) => {
    const startRow = Math.floor(startPos / gridSize);
    const startCol = startPos % gridSize;
    const endRow = Math.floor(endPos / gridSize);
    const endCol = endPos % gridSize;
  
    const dRow = Math.abs(endRow - startRow);
    const dCol = Math.abs(endCol - startCol);
    const sRow = startRow < endRow ? 1 : -1;
    const sCol = startCol < endCol ? 1 : -1;
  
    let err = dRow - dCol;
    let row = startRow;
    let col = startCol;
  
    while (row !== endRow || col !== endCol) {
      if (isWall(row * gridSize + col)) {
        return false; // Wall blocks LOS
      }
  
      const err2 = 2 * err;
      if (err2 > -dCol) {
        err -= dCol;
        row += sRow;
      }
      if (err2 < dRow) {
        err += dRow;
        col += sCol;
      }
    }
  
    // Check the end position as well
    if (isWall(endRow * gridSize + endCol)) {
      return false; // End position is also blocked
    }
  
    return true; // No walls, LOS is clear
  };

  const handleCoinFlip = () => {
    setCurrentTurn(Math.random() < 0.5 ? 'red' : 'blue');
    setFlipDone(true);
  };


  
  
  const handleTileClick = (index) => {
    if (currentTurn !== currentMovingToken) return;
  
    const character = selectedCharacters.find((char, idx) => currentMovingToken === (idx === 0 ? 'red' : 'blue'));
    if (!character) return;

    const attributes = combineAttributes(character);
    let maxTiles = Math.floor(attributes.speed / tileFeet);

    // Check if the character is slowed
    if (slowEffects[character.id] > 0) {
        maxTiles = Math.floor(maxTiles / 2);  // Halve the movement if slowed
    }

    // Apply movement spell effect
    if (movementSpellActive) {
        maxTiles *= 2;  // Double the movement if a movement spell was cast
    }

    const currentPosition = tokenPositions[currentMovingToken];
    const [currentRow, currentCol] = [Math.floor(currentPosition / gridSize), currentPosition % gridSize];
    const [targetRow, targetCol] = [Math.floor(index / gridSize), index % gridSize];

    const path = findPath([currentRow, currentCol], [targetRow, targetCol]);
    const pathLength = path ? path.length - 1 : 0;

    if (path && pathLength <= maxTiles && movedDistance[currentMovingToken] + pathLength <= maxTiles) {
        setTokenPositions((prev) => ({ ...prev, [currentMovingToken]: index }));
        setMovedDistance((prev) => ({ ...prev, [currentMovingToken]: prev[currentMovingToken] + pathLength }));
    } else {
        console.log("Movement exceeds allowed distance or no valid path found.");
    }
};
const handleEndTurn = () => {
  // Mark the current character's turn as ended
  const newHasEndedTurn = { ...hasEndedTurn, [currentTurn]: true };
  setHasEndedTurn(newHasEndedTurn);

  // Apply the slow effect reduction at the end of the turn
  endTurn();

  // Reset movement spell state at the end of the turn
  setMovementSpellActive(false);

  // Check if both characters have ended their turns
  if (newHasEndedTurn.red && newHasEndedTurn.blue) {
    handleEndRound(); // Proceed to the next round if both have ended their turns
  } else {
    // Switch to the other character if the current character's turn has ended
    if (currentTurn === 'red') {
      setCurrentTurn('blue');
    } else {
      setCurrentTurn('red');
    }

    // Reset moved distance and attack state for the character whose turn just ended
    setMovedDistance((prev) => ({ ...prev, [currentTurn]: 0 })); // Reset for the current character
    setHasAttacked((prev) => ({ ...prev, [currentTurn]: false })); // Reset attack state
  }
};
const handleEndRound = () => {
  setRoundCounter((prev) => prev + 1);
  setCurrentTurn('red');
  setMovedDistance({ red: 0, blue: 0 });
  setHasAttacked({ red: false, blue: false });
  setHasEndedTurn({ red: false, blue: false });

  // Decrement unheal effects
  setUnhealEffects((prev) => {
    const newEffects = { ...prev };
    for (const charId in newEffects) {
      if (newEffects[charId] > 0) {
        newEffects[charId] -= 1;
      }
      if (newEffects[charId] === 0) {
        delete newEffects[charId];
      }
    }
    return newEffects;
  });

  // Apply acid damage at the end of the round
  setSelectedCharacters((prev) =>
    prev.map((char) => {
      const acidEffect = acidDamageEffects[char.id];
      if (acidEffect && acidEffect.roundsRemaining > 0) {
        const newHealth = char.health - acidEffect.damagePerRound;
        const newRoundsRemaining = acidEffect.roundsRemaining - 1;

        // Update the acid effect rounds remaining
        setAcidDamageEffects((prev) => ({
          ...prev,
          [char.id]: { ...acidEffect, roundsRemaining: newRoundsRemaining },
        }));
        
        // Remove the effect if it has expired
        if (newRoundsRemaining <= 0) {
          setAcidDamageEffects((prev) => {
            const { [char.id]: _, ...rest } = prev;
            return rest;
          });
        }

        return { ...char, health: newHealth };
      }
      return char;
    })
  );

  // Decrement slow effects
  setSelectedCharacters((prev) =>
    prev.map((char) => {
      if (char.slowedRounds > 0) {
        const newSlowedRounds = char.slowedRounds - 1;
        if (newSlowedRounds === 0) {
          return { ...char, speed: char.originalSpeed, slowedRounds: 0 };
        }
        return { ...char, slowedRounds: newSlowedRounds };
      }
      return char;
    })
  );
};
  
  // New function to handle slow effect decrement
  const endTurn = () => {
    setSlowEffects((prev) => {
        const updatedEffects = {};
        Object.keys(prev).forEach((characterId) => {
            if (prev[characterId] > 1) {
                updatedEffects[characterId] = prev[characterId] - 1;
            }
        });
        return updatedEffects;
    });

   
};


  const areTokensWithinFiveFeet = () => {
    const [redRow, redCol] = [Math.floor(tokenPositions.red / gridSize), tokenPositions.red % gridSize];
    const [blueRow, blueCol] = [Math.floor(tokenPositions.blue / gridSize), tokenPositions.blue % gridSize];
    return Math.abs(redRow - blueRow) <= 1 && Math.abs(redCol - blueCol) <= 1;
  };

 
  const getSpellAnimationClass = (damageType, effects) => {
    if (effects === 'heal') {
        return 'heal-animation heal-effect';
    } else if (effects === 'unheal') {
        return 'unheal-animation';
    } else if (effects === 'damage' && damageType === 'radiant') {
        return 'radiant-damage-animation'; // Add a specific animation class for radiant damage
    }
    return 'default-animation'; // Fallback for unrecognized cases
};
const handleAttack = () => {
  if (!areTokensWithinFiveFeet()) return;

  // Check if the current character has already attacked or cast a spell this turn
  if (hasAttacked[currentTurn]) {
      console.log(`${currentTurn} has already attacked or cast a spell this turn.`);
      return; // Prevent further actions in this turn
  }

  // Set the hasAttacked state to true for the current character
  setHasAttacked((prev) => ({ ...prev, [currentTurn]: true }));

  // Roll a d20 for attack check
  const diceRoll = rollDice(20);
  console.log(`d20 Roll: ${diceRoll}`);

  // Find the attacking and defending characters
  const attackingCharacter = selectedCharacters.find((char, idx) => currentTurn === (idx === 0 ? 'red' : 'blue'));
  const defendingCharacter = selectedCharacters.find((char, idx) => currentTurn !== (idx === 0 ? 'red' : 'blue'));

  if (!attackingCharacter || !defendingCharacter) return;

  const attributes = combineAttributes(attackingCharacter);
  const weapon = getWeaponById(attackingCharacter.equippedWeaponId);

  // Ensure diceType is valid before using it
  const diceType = weapon.diceType || 'd6';
  const diceSides = parseInt(diceType.replace('d', ''), 10) || 6;

  // Calculate weapon damage
  const weaponDamage = rollDice(diceSides);
  console.log(`Weapon Dice Roll (${diceType}): ${weaponDamage}`);

  const totalDamage = weaponDamage + attributes.attackPower;

  // Calculate attack roll
  const attackRoll = diceRoll + attributes.attackBonus;
  console.log(`Attack Roll: ${attackRoll}`);

  // Get defender's Armor Class
  const defenderAC = combineAttributes(defendingCharacter).armorClass;

  // Get the token for the defending character
  const defenderToken = document.querySelector(`.tile-map-token.${currentTurn === 'red' ? 'blue' : 'red'}`);

  // Handle attack outcome
  if (attackRoll >= defenderAC) {
      const currentHealth = defendingCharacter.health !== undefined ? defendingCharacter.health : combineAttributes(defendingCharacter).health;
      const newHealth = Math.max(currentHealth - totalDamage, 0);

      // Update the health of the defending character
      setSelectedCharacters((prev) =>
          prev.map((char) =>
              char === defendingCharacter ? { ...char, health: newHealth } : char
          )
      );

      // Check if the defending character's health reaches 0
      if (newHealth === 0) {
          alert(`${defendingCharacter.name} has been defeated!`);
      }

      // Trigger attack animations
      addSlashEffect(defenderToken);
      createBloodParticles(defenderToken); // Trigger blood particles immediately

      alert(`Attack Successful! Dice Roll: ${diceRoll}, Attack Roll: ${attackRoll}, Weapon Damage Roll: ${weaponDamage}, Total Damage: ${totalDamage}`);
  } else {
      alert(`Attack Missed! Dice Roll: ${diceRoll}, Attack Roll: ${attackRoll}, Required: ${defenderAC}`);
  }
};


const applySlowEffect = (characterId) => {
  setSlowEffects((prev) => ({
    ...prev,
    [characterId]: 3,  // Set slow effect to last for 3 rounds
  }));
};


const handleSpellCast = (spell) => {
  // Prevent actions if the character has already acted
  if (hasAttacked[currentTurn]) {
      alert(`${currentTurn} has already attacked or cast a spell this turn.`);
      return;
  }

  // Identify the attacking and defending characters
  const attackingCharacter = selectedCharacters.find((char, idx) => currentTurn === (idx === 0 ? 'red' : 'blue'));
  const defendingCharacter = selectedCharacters.find((char, idx) => currentTurn !== (idx === 0 ? 'red' : 'blue'));

  if (!attackingCharacter || !defendingCharacter) return;

  const attributes = combineAttributes(attackingCharacter);
  let alertMessage = `${currentTurn} casts ${spell.name}.\n`; // Start alert message

  const attackerToken = document.querySelector(`.tile-map-token.${currentTurn}`);
  const defenderToken = document.querySelector(`.tile-map-token.${currentTurn === 'red' ? 'blue' : 'red'}`);

  // Handle spell animation
  const spellAnimationClass = getSpellAnimationClass(spell.damageType, spell.effects);

  if (attackerToken) {
      attackerToken.classList.remove('heal-animation', 'damage-animation', 'unheal-animation', 'default-animation', 'heal-effect', 'damage-effect', 'unheal-effect', 'fade-out');

      spellAnimationClass.split(' ').forEach(className => {
          attackerToken.classList.add(className);
      });

      // Create sparkles when healing
      if (spell.effects === 'heal') {
          createSparkles(attackerToken);
      }

      setTimeout(() => {
          spellAnimationClass.split(' ').forEach(className => {
              attackerToken.classList.remove(className);
          });
      }, 2000); // Adjust this duration to match your animation length
  } else {
      alertMessage += `Attacker token not found for current turn: ${currentTurn}\n`;
  }

  // Handle special effects for healing
  if (spell.effects === 'heal') {
      if (unhealEffects[attackingCharacter.id] > 0) {
          alertMessage += `${attackingCharacter.name} cannot heal for ${unhealEffects[attackingCharacter.id]} more rounds!\n`;
          alert(alertMessage);
          return;
      }
      const healAmount = handleSpellEffect(spell, attackingCharacter, 'heal');
      alertMessage += `Healing Successful! Healed for: ${healAmount}\n`;
      setHasAttacked((prev) => ({ ...prev, [currentTurn]: true })); // Mark as acted
      alert(alertMessage);
      return;
  }

  const isMovementEffect = spell.effects.includes('movement');

  // For movement effect spells, set the movement spell active
  if (isMovementEffect) {
      setMovementSpellActive(true); // Activate the movement spell effect for the turn
      alertMessage += `${attackingCharacter.name}'s speed is doubled for this turn!\n`;
      setHasAttacked((prev) => ({ ...prev, [currentTurn]: true })); // Mark as acted
      alert(alertMessage);
      return;  // Exit early to prevent attack logic from executing
  }

  // Check if the spell has a damage effect
  const spellRange = spell.spellRange; // Use the original spell range

  // For damage spells, check if the target is in range (only if not self)
  if (!isMovementEffect) {
      const isTargetInRange = isInRange(spellRange / tileFeet, tokenPositions[currentMovingToken], tokenPositions[currentMovingToken === 'red' ? 'blue' : 'red']);
      if (!isTargetInRange) {
          alertMessage += `Target is out of range! Spell range is ${spellRange} feet.\n`;
          alert(alertMessage);
          // Do NOT mark as acted since the action was not valid
          return; // Allow retrying the action
      }

      // Check for line of sight
      const attackerPos = tokenPositions[currentMovingToken];
      const defenderPos = tokenPositions[currentMovingToken === 'red' ? 'blue' : 'red'];
      if (!hasLineOfSight(attackerPos, defenderPos)) {
          alertMessage += 'Line of sight is blocked by a wall, cannot cast spell.\n';
          alert(alertMessage);
          setHasAttacked((prev) => ({ ...prev, [currentTurn]: true })); // Mark as acted
          return;
      }
  }

  // Roll for attack check
  const diceRoll = rollDice(20);
  alertMessage += `d20 Roll: ${diceRoll}\n`;

  // Calculate the attack roll based on damage type
  let attackRoll = (spell.damageType === 'ability') ?
      diceRoll + attributes.attackBonus :
      diceRoll + attributes.spellAttack;

  alertMessage += `Attack Roll: ${attackRoll} (Dice Roll: ${diceRoll} + Bonus: ${spell.damageType === 'ability' ? attributes.attackBonus : attributes.spellAttack})\n`;

  // Get the defender's Armor Class
  const defenderAC = combineAttributes(defendingCharacter).armorClass;

  // Alert the defender's AC for better clarity
  alertMessage += `${defendingCharacter.name}'s Armor Class is ${defenderAC}.\n`;

  // Check if the attack roll meets or exceeds the defender's Armor Class
  if (attackRoll >= defenderAC) {
      const totalDamage = handleSpellEffect(spell, defendingCharacter, 'damage', spell.damageType === 'ability' ? attributes.attackPower : attributes.spellPower);
      alertMessage += `Spell Cast Successful! Total Damage (including effects): ${totalDamage}\n`;

      // Log details of the damage
      alertMessage += `Damage Calculation: Spell Power: ${spell.damageType === 'ability' ? attributes.attackPower : attributes.spellPower}\n`;

      // Apply acid damage over 3 rounds if the spell has the 'acid' damage type
      if (spell.damageType === 'acid') {
          createAcidBubbles(defenderToken); // Call the acid bubbles effect
          const damagePerRound = handleSpellEffect(spell, defendingCharacter, 'damage');
          setAcidDamageEffects((prev) => ({
              ...prev,
              [defendingCharacter.id]: { damagePerRound, roundsRemaining: 3 },
          }));
          alertMessage += `${defendingCharacter.name} will take ${damagePerRound} acid damage for the next 3 rounds!\n`;
      }

      // Apply the slow effect if the spell has a slow effect
      if (spell.effects.includes('slow')) {
          applySlowEffect(defendingCharacter.id);
          addSlowEffect(defenderToken, true);
          const originalSpeed = combineAttributes(defendingCharacter).speed;
          const slowedSpeed = originalSpeed / 2;
          setSelectedCharacters((prev) =>
              prev.map((char) =>
                  char.id === defendingCharacter.id ? { ...char, speed: slowedSpeed } : char
              )
          );
          alertMessage += `${defendingCharacter.name}'s speed has been halved for 3 rounds!\n`;
      }

      // Create golden sparkles for radiant damage on successful hit
      if (spell.damageType === 'radiant' && spell.effects === 'damage') {
          createGoldenSparkles(defenderToken);
      }

      // Trigger blood particle animation for ability damage
      if (spell.damageType === 'ability' && spell.effects === 'damage') {
          createBloodParticles(defenderToken);
      }

      // Apply the unheal effect if it's an unheal spell
      if (spell.effects === 'unheal' && defenderToken) {
          addUnhealEffect(defenderToken);
          alertMessage += `${defendingCharacter.name} has been marked as unhealed for 3 rounds!\n`;
      }

  } else {
      alertMessage += `Attack missed! Total Attack Roll was ${attackRoll}, which is less than ${defenderAC}.\n`;
  }

  // Update attack state after casting a spell (moved here to ensure it's called for both hit and miss)
  setHasAttacked((prev) => ({ ...prev, [currentTurn]: true }));

  alert(alertMessage); // Show all messages in one alert
};

// Helper function to apply spell effects (damage or healing)
const handleSpellEffect = (spell, targetCharacter, effectType, attackPower = 0, defenderToken) => {
  let totalEffect = 0;

  if (effectType === 'damage') {
      const weapon = getWeaponById(targetCharacter.weaponId); // Fetch weapon data
      const diceType = weapon.diceType || 'd6'; // Ensure diceType is valid
      const diceSides = parseInt(diceType.replace('d', ''), 10) || 6;

      // Roll for spell damage
      const spellEffectRoll = rollDice(diceSides);
      totalEffect = spellEffectRoll + attackPower; // Calculate total damage

      // Get current health and max health
      const currentHealth = targetCharacter.health ?? combineAttributes(targetCharacter).health;
      const newHealth = Math.max(currentHealth - totalEffect, 0);

      setSelectedCharacters((prev) =>
          prev.map((char) =>
              char.id === targetCharacter.id ? { ...char, health: newHealth } : char
          )
      );

      if (newHealth === 0) {
          alert(`${targetCharacter.name} has been defeated!`);
      }

      return totalEffect; // Return the total damage for alert
  } else if (effectType === 'heal') {
      // Healing logic
      const diceType = spell.diceType || 'd6'; // Default dice type if not specified
      const diceSides = parseInt(diceType.replace('d', ''), 10) || 6;

      // Roll for healing
      const healRoll = rollDice(diceSides);
      totalEffect = healRoll; // Healing amount from the dice roll

      // Get current health and max health
      const currentHealth = targetCharacter.health ?? combineAttributes(targetCharacter).health;
      const maxHealth = combineAttributes(targetCharacter).maxHealth; // Use maxHealth here
      const newHealth = Math.min(currentHealth + totalEffect, maxHealth); // Ensure not exceeding maxHealth

      setSelectedCharacters((prev) =>
          prev.map((char) =>
              char.id === targetCharacter.id ? { ...char, health: newHealth } : char
          )
      );

      return totalEffect; // Return the healing amount
  }
};
const rollDice = (sides) => {
  return Math.floor(Math.random() * sides) + 1;
};
const isInRange = (spellRange, casterPosition, targetPosition) => {
  const [casterRow, casterCol] = [Math.floor(casterPosition / gridSize), casterPosition % gridSize];
  const [targetRow, targetCol] = [Math.floor(targetPosition / gridSize), targetPosition % gridSize];

  const rowDiff = Math.abs(casterRow - targetRow);
  const colDiff = Math.abs(casterCol - targetCol);

  const distance = Math.max(rowDiff, colDiff);
  return distance <= spellRange; // Check if the target is within the spell range
};

return (
  <div className="tile-map-wrapper info-wrapper">
    <div className="tile-map-controls">
     
      
      {!flipDone && <button className="tile-map-btn" onClick={handleCoinFlip}>Flip Coin</button>}
    

      <div className="charStateOne">
  <h4>{selectedCharacters[0]?.name}</h4>
  <p className="health-display">
    <strong>Health:</strong> {selectedCharacters[0]?.health ?? combineAttributes(selectedCharacters[0])?.health}
  </p>
  {unhealEffects[selectedCharacters[0]?.id] > 0 && (
    <div className="debuff-effect">
      <FontAwesomeIcon icon={faExclamationTriangle} className="debuff-icon" />
      <span>{unhealEffects[selectedCharacters[0]?.id]} rounds</span>
    </div>
  )}
  {slowEffects[selectedCharacters[0]?.id] > 0 && (
    <div className="slow-effect">
      <FontAwesomeIcon icon={faClock} className="slow-icon" />
      <span>{slowEffects[selectedCharacters[0]?.id]} rounds</span>
    </div>
  )}
   {acidDamageEffects[selectedCharacters[0]?.id]?.roundsRemaining > 0 && (
    <div className="acid-effect">
      <FontAwesomeIcon icon={faSkullCrossbones} className="acid-icon" />
      <span>{acidDamageEffects[selectedCharacters[0]?.id]?.roundsRemaining} rounds</span>
    </div>
  )}
</div>

<div className="charStateOne">
  <h4>{selectedCharacters[1]?.name}</h4>
  <p className="health-display">
    <strong>Health:</strong> {selectedCharacters[1]?.health ?? combineAttributes(selectedCharacters[1])?.health}
  </p>
  {unhealEffects[selectedCharacters[1]?.id] > 0 && (
    <div className="debuff-effect">
      <FontAwesomeIcon icon={faExclamationTriangle} className="debuff-icon" />
      <span>{unhealEffects[selectedCharacters[1]?.id]} rounds</span>
    </div>
  )}
  {slowEffects[selectedCharacters[1]?.id] > 0 && (
    <div className="slow-effect">
      <FontAwesomeIcon icon={faClock} className="slow-icon" />
      <span>{slowEffects[selectedCharacters[1]?.id]} rounds</span>
    </div>
  )}
   {acidDamageEffects[selectedCharacters[1]?.id]?.roundsRemaining > 0 && (
    <div className="acid-effect">
      <FontAwesomeIcon icon={faSkullCrossbones} className="acid-icon" />
      <span>{acidDamageEffects[selectedCharacters[1]?.id]?.roundsRemaining} rounds</span>
    </div>
  )}
</div>
    </div>

    <div className="tile-map-wrapper">
  <div className="tile-map-container">
    <div className="tile-map-grid">
      {Array.from({ length: gridSize * gridSize }).map((_, index) => (
        <div
          key={index}
          className={`tile-map-tile ${isWall(index) ? 'wall' : ''}`}
          onClick={() => handleTileClick(index)}
        >
          {index === tokenPositions.red && selectedCharacters[0]?.classImage && (
            <img
              className="tile-map-token red"
              src={selectedCharacters[0].classImage}
              alt="Red Token"
            />
          )}
          {index === tokenPositions.blue && selectedCharacters[1]?.classImage && (
            <img
              className="tile-map-token blue"
              src={selectedCharacters[1].classImage}
              alt="Blue Token"
            />
          )}
        </div>
      ))}
    </div>
  </div>

  {/* Controls section on the right */}
  <div className="character-details__spells">
      <h4>Cast Spell:</h4>
      <div className="spells-container">
        {combineAttributes(currentCharacter).spells.map((spell) => (
          <div key={spell.id} className="spell-item" onClick={() => handleSpellCast(spell)}>
            <div className="spell-icon">
              <img src={damageTypeImageMap[spell.damageType]} alt={spell.damageType} className="spell-image" />
            </div>
            <div className="spell-info">
              <p><strong>Name:</strong> {spell.name}</p>
              <p><strong>Description:</strong> {spell.description}</p>
              <p><strong>Dice Type:</strong> {spell.diceType}</p>
              <p><strong>Range:</strong> {spell.spellRange}</p>
              <p><strong>Effect:</strong> {spell.effects}</p>
            </div>
          </div>
        ))}
      </div>

      <h4>Melee Attack:</h4>
      {!hasAttacked[currentTurn] && (
        <button className="tile-map-btn attack-btn" onClick={handleAttack}>
          <img src={attackIcon} alt="Attack" className="attack-icon" />
        </button>
      )}

      <h4>Actions:</h4>
      {currentTurn && (
        <button
          className="tile-map-btn"
          disabled={!currentTurn || movedDistance[currentTurn] >= Math.floor(combineAttributes(currentCharacter)?.speed / tileFeet)}
          onClick={() => setCurrentMovingToken(currentTurn)}
        >
          Move
        </button>
      )}
      {flipDone && <button className="tile-map-btn" onClick={handleEndTurn}>End Turn</button>}
    </div>
</div>


    {currentCharacter && (
      <div className="character-info-container ">
        <div className="character-info">
          <p>Current Turn: {currentTurn === 'red' ? 'Red Token' : 'Blue Token'}</p>
          <div className="round-counter">Round: {roundCounter}</div> {/* Display round counter */}
          <div className="character-details">
            <h4>{currentCharacter.name}</h4>
            <p><strong>Class:</strong> {getClassNameById(currentCharacter.classId)}</p>
            <p><strong>Race:</strong> {getRaceById(currentCharacter.raceId).name}</p>
            <p><strong>Attack Bonus:</strong> {combineAttributes(currentCharacter).attackBonus}</p>
            <p><strong>Attack Power:</strong> {combineAttributes(currentCharacter).attackPower}</p>
            <p><strong>Spell Attack:</strong> {combineAttributes(currentCharacter).spellAttack}</p>
            <p><strong>Spell Power:</strong> {combineAttributes(currentCharacter).spellPower}</p>
            <p><strong>Health:</strong> {combineAttributes(currentCharacter).health}</p>
            <p><strong>Armor Class:</strong> {combineAttributes(currentCharacter).armorClass}</p>
            <p><strong>Speed:</strong> {combineAttributes(currentCharacter).speed}</p>
          </div>

         

        
        </div>
      </div>
    )}
  </div>
);
};

export default TileMap;
