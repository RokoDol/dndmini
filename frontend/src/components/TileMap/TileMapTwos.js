import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import './TileMapTwos.css';
import { mapData } from '../Maps/twosMap';
import Notifications from './Notifications.js'; // Adjust the path as needed
import { showNotification } from './Notifications'; // Adjust path
import { useLocation } from 'react-router-dom'; // Ensure you have this import


// Import images for different damage types
import abilityImage from '../spellImages/ability.png';
import radiantImage from '../spellImages/radiant.png';
import fireImage from '../spellImages/fire.png';
import coldImage from '../spellImages/cold.png';
import necroticImage from '../spellImages/necrotic.png';
import healingImage from '../spellImages/healing.png';
import acidImage from '../spellImages/acid.png';
import moveImage from '../spellImages/move.png';
import attackImage from '../tokeni/attack.png';


const TileMapTwos = ({ onExit, characters, selectedSpells, }) => {
  const rows = 24;
  const columns = 11;
  const mapRef = useRef(null);
  const squareSize = 5; // Each square represents 5 feet
  const location = useLocation(); // Access the current location and state
  const fromChapterOne = location.state?.fromChapterOne || false; // Check if we came from ChapterOne


  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [raceData, setRaceData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [races, setRaces] = useState([]);
  const [classes, setClasses] = useState([]);
  const [spells, setSpells] = useState([]);
  
  const [items, setItems] = useState([]);
  const [currentHealth, setCurrentHealth] = useState({});
  const [round, setRound] = useState(1); // Initialize round to 1
  const [initiativeOrder, setInitiativeOrder] = useState([]);
  const [isInitiativeRolled, setIsInitiativeRolled] = useState(false);
  const [showRollInitiativeOverlay, setShowRollInitiativeOverlay] = useState(true);
  const [validMoveSquares, setValidMoveSquares] = useState([]);
  
  const [validAttackSquares, setValidAttackSquares] = useState([]);
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [spellCooldowns, setSpellCooldowns] = useState({});
  const [activeEffects, setActiveEffects] = useState({});
  const [isMovementDoubled, setIsMovementDoubled] = useState(false);
  const [slowedCharacters, setSlowedCharacters] = useState({});
  const [aoeHighlightSquares, setAoeHighlightSquares] = useState([]);
  const [hoveredSquare, setHoveredSquare] = useState(null);
  const [actionPerformed, setActionPerformed] = useState({}); // Track actions per character
  
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState(''); // To store winner message
  const [isNpcTurn, setIsNpcTurn] = useState(false);

  const safeCharacters = Array.isArray(characters) ? characters : [];

  // Filter for team1 (Gold Team)
  const team1 = characters.filter((char) => {
    return char.team === 'gold' || (char.npc && char.team === 'gold');
  });

  // Filter for team2 (Green Team)
  const team2 = characters.filter((char) => {
    return char.team === 'green' || (char.npc && char.team === 'green');
  });

  // Filter out characters that are dead (i.e., health <= 0)
  const aliveTeam1 = team1.filter(char => currentHealth[char.id] > 0);
  const aliveTeam2 = team2.filter(char => currentHealth[char.id] > 0);


  useEffect(() => {
    // Check if the Gold Team wins
    if (aliveTeam1.length > 0 && aliveTeam2.length === 0) {
      if (fromChapterOne) {
        // Enhanced message for Gold Team win when coming from ChapterOne
        setWinnerMessage("Gold Team Wins! You saved the boy and earned a trusted ally for the journey ahead.");
      } else {
        setWinnerMessage("Gold Team Wins!");
      }
      setShowWinnerOverlay(true);
    } 
    // Check if the Green Team wins
    else if (aliveTeam1.length === 0 && aliveTeam2.length > 0) {
      setWinnerMessage("Green Team Wins!");
      setShowWinnerOverlay(true);
    }
  
    // Hide the winner overlay after 5 seconds
    if (showWinnerOverlay) {
      const timer = setTimeout(() => {
        setShowWinnerOverlay(false);
      }, 5000); // 5 seconds delay
      return () => clearTimeout(timer);
    }
  }, [aliveTeam1, aliveTeam2, showWinnerOverlay, fromChapterOne]);
const [positions, setPositions] = useState({
  [team1[0]?.id]: { row: 1, col: 0 },
  [team1[1]?.id]: { row: 0, col: 1 },
  [team2[0]?.id]: { row: rows - 2, col: 10 },
  [team2[1]?.id]: { row: rows - 1, col: 9 },
  [team2[2]?.id]: { row: rows - 1, col: 6 },
  [team2[3]?.id]: { row: rows - 1, col: 5 },
  [team2[4]?.id]: { row: rows - 1, col: 4 },
});
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [isAttackMode, setIsAttackMode] = useState(false); // New state for attack mode
  const [remainingMovement, setRemainingMovement] = useState(0); // New state for movement tracking

  const gridSize = 24; // Number of columns in your grid (from CSS)

 // Checks if a given position is a wall
 const isWall = useCallback((index) => {
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  return mapData?.walls.some((wall) => wall.x === col && wall.y === row);
}, [gridSize]);

const isDiagonalValid = useCallback((row1, col1, row2, col2) => {
  // Check if both adjacent tiles are walls
  const horizontalWall = isWall(row1 * gridSize + col2);
  const verticalWall = isWall(row2 * gridSize + col1);

  return !(horizontalWall && verticalWall); // Diagonal is valid if at least one path is open
}, [isWall, gridSize]);





const findPath = useCallback((start, end) => {
  const queue = [[start]]; // Start with the initial position
  const visited = new Set(); // Track visited nodes
  const directions = [
    [-1, 0],  // Up
    [1, 0],   // Down
    [0, -1],  // Left
    [0, 1],   // Right
    [-1, -1], // Up-left diagonal
    [-1, 1],  // Up-right diagonal
    [1, -1],  // Down-left diagonal
    [1, 1],   // Down-right diagonal
  ];

  visited.add(`${start[0]},${start[1]}`); // Mark the start as visited

  while (queue.length > 0) {
    const path = queue.shift();
    const [currentRow, currentCol] = path[path.length - 1];

    // Check if the destination is reached
    if (currentRow === end[0] && currentCol === end[1]) {
      return path; // Return the full path
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
        // Validate diagonal moves
        if (Math.abs(dRow) + Math.abs(dCol) === 2 && !isDiagonalValid(currentRow, currentCol, newRow, newCol)) {
          continue; // Skip invalid diagonal moves
        }

        // Add to visited and queue
        visited.add(`${newRow},${newCol}`);
        queue.push([...path, [newRow, newCol]]);
      }
    }
  }

  return null; // Return null if no path is found
}, [isWall, isDiagonalValid, gridSize]);

const hasLineOfSight = useCallback((start, end) => {
  const [startRow, startCol] = start;
  const [endRow, endCol] = end;

  // Differences between start and end points
  const dx = Math.abs(endCol - startCol);
  const dy = Math.abs(endRow - startRow);
  
  const sx = startCol < endCol ? 1 : -1;
  const sy = startRow < endRow ? 1 : -1;
  
  let err = dx - dy;
  let x = startCol;
  let y = startRow;

  // Bresenham's line algorithm
  while (x !== endCol || y !== endRow) {
    // Calculate the index of the current grid cell
    const index = y * gridSize + x;

    // Check if there's a wall at this position
    if (isWall(index)) {
      return false; // Line of sight is blocked
    }

    // Calculate the next step based on the error term
    const e2 = err * 2;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return true; // No walls along the line of sight
}, [gridSize, isWall]); // Add dependencies to useCallback



  
  const damageTypeImageMap = {
    ability: abilityImage,
    radiant: radiantImage,
    cold: coldImage,
    fire: fireImage,
    necrotic: necroticImage,
    heal: healingImage,
    acid: acidImage,
  };

  const combineStats = (raceStat, classStat) => {
    return (raceStat || 0) + (classStat || 0);
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charactersResponse, itemsResponse, spellsResponse, classesResponse, racesResponse, npcsResponse] = await Promise.all([
          axios.get('http://localhost:5000/characters/getCharacters'),
          axios.get('http://localhost:5000/items/getItems'),
          axios.get('http://localhost:5000/spells/getSpells'),
          axios.get('http://localhost:5000/classes/getClasses'),
          axios.get('http://localhost:5000/races/getRaces'),
          axios.get('http://localhost:5000/npcs/getNpcs')
        ]);
  
        setItems(itemsResponse.data);
        setSpells(spellsResponse.data);
        setClasses(classesResponse.data);
        setRaces(racesResponse.data);
  
        // Initialize spell cooldowns to null for all spells
        const initialCooldowns = {};
        spellsResponse.data.forEach(spell => {
          initialCooldowns[spell.id] = null; // No cooldown at the beginning
        });
        setSpellCooldowns(initialCooldowns);
  
        // Initialize health values
        const initialHealth = {};
  
        // For characters
        charactersResponse.data.forEach(character => {
          if (character) {
            const totalHealth = combineStats(
              racesResponse.data.find(race => race.id === character.raceId)?.health || 0,
              classesResponse.data.find(clas => clas.id === character.classId)?.health || 0
            );
            initialHealth[character.id] = totalHealth;
  
            // Check if the character has spells assigned
            if (character.spellIds && character.spellIds.length > 0) {
              console.log(`${character.name} has the following spells assigned:`);
              character.spellIds.forEach(spellId => {
                const spell = spellsResponse.data.find(spell => spell.id === spellId);
                if (spell) {
                  console.log(`- ${spell.name}`);
                }
              });
            } else {
              console.log(`${character.name} has no spells assigned.`);
            }
          }
        });
  
        // For NPCs
        npcsResponse.data.forEach(npc => {
          if (npc) {
            initialHealth[npc.id] = npc.health; // Use npc.health directly
  
            // Check if the NPC has spellIds and log the spell
            if (npc.spellIds && npc.spellIds.length > 0) {
              console.log(`${npc.name} has the following spells assigned:`);
              npc.spellIds.forEach(spellId => {
                const spell = spellsResponse.data.find(spell => spell.id === spellId);
                if (spell) {
                  console.log(`- ${spell.name} (spellId: ${spell.id})`);
                }
              });
            } else {
              console.log(`${npc.name} has no spells assigned.`);
            }
          }
        });
  
        setCurrentHealth(initialHealth);
  
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);
  
  
  


const getCharacterSpeedInSquares = (characterId) => {
  const character = characters.find(char => char.id === characterId);
  if (character) {
    const raceData = races.find(race => race.id === character.raceId);
    const classData = classes.find(clas => clas.id === character.classId);
    const speedInFeet = (raceData.speed || 0) + (classData.speed || 0); // Total speed in feet
    return Math.floor(speedInFeet / squareSize); // Speed in squares per turn (5 feet per square)
  }
  return 0; // Default if no character is found
};



  useEffect(() => {
    if (initiativeOrder.length > 0) {
      const currentCharacter = characters.find((_, i) => i === initiativeOrder[currentTurnIndex]?.index);
      const currentRace = races.find(race => race.id === currentCharacter.raceId);
      setRaceData(currentRace || null);
      const currentClass = classes.find(clas => clas.id === currentCharacter.classId);
      setClassData(currentClass || null);
      
    }
  }, [currentTurnIndex, characters, races, classes, initiativeOrder]);
  const handleEnterFullScreen = () => {
    if (mapRef.current && mapRef.current.requestFullscreen) {
      mapRef.current.requestFullscreen();
    }
  };

  
  const getWeaponById = (weaponId) => {
    // Find the weapon in the items state that matches the provided weaponId
    const weapon = items.find((item) => item.id === weaponId);
    return weapon ? weapon : null; // Return null if not found
};
  const resetModes = () => {
    setSelectedSpell(null);
    setIsMoveMode(false);
    setIsAttackMode(false);
};


const handleSpellClick = (spell) => {
  resetModes(); // Reset other modes
  setSelectedSpell(spell); // Set selected spell for targeting
      highlightSpellRange();
      if (spell.effects.includes('movement')) {
        setIsMovementDoubled(true);
    }
};

const rollInitiative = () => {
  const rolls = characters.map((character, index) => ({
    name: character.name || `NPC ${character.id}`, // Use backticks for template literals
    roll: Math.floor(Math.random() * 20) + 1,
    index: index, // Preserve original index in the characters array
  }));
 
  // Handle ties
  let tieRolls = rolls.filter(roll => rolls.filter(r => r.roll === roll.roll).length > 1);
  while (tieRolls.length > 0) {
    tieRolls.forEach(tiedRoll => {
      const reRoll = Math.floor(Math.random() * 20) + 1;
      tiedRoll.roll = reRoll;
    });
    tieRolls = rolls.filter(roll => rolls.filter(r => r.roll === roll.roll).length > 1);
  }

  console.log('Rolls After Tie Check:', rolls); // Debugging output for resolved ties

  // Sort rolls in descending order of initiative
  const sortedRolls = rolls.sort((a, b) => b.roll - a.roll);

  // Filter out dead characters (those with health <= 0)
  const aliveSortedRolls = sortedRolls.filter((roll) => {
    const character = characters[roll.index];
    return currentHealth[character.id] > 0; // Only keep characters with health > 0
  });

  console.log('Alive Rolls:', aliveSortedRolls); // Debugging output for alive characters

  setInitiativeOrder(aliveSortedRolls); // Set the initiative order with only alive characters
  setIsInitiativeRolled(true);
  setShowRollInitiativeOverlay(false); // Hide the roll initiative overlay after rolling
  setCurrentTurnIndex(0); // Start with the first in the sorted order
  setRound(1); // Reset round to 1 when initiative is rolled
};
// Handles NPC turns
const handleNpcTurn = (currentCharacter) => {
  if (currentCharacter.isNpc) {
    const opposingTeam = currentCharacter.team === 'gold' ? team2 : team1;
    const closestEnemy = findClosestEnemy(currentCharacter, opposingTeam);

    if (closestEnemy) {
      const npcPosition = positions[currentCharacter.id]; // This line causes the warning
      const enemyPosition = positions[closestEnemy.id];

      const distance = Math.max(
        Math.abs(npcPosition.row - enemyPosition.row),
        Math.abs(npcPosition.col - enemyPosition.col)
      );

      // Check if the NPC has any spells assigned
      if (currentCharacter.spellIds && currentCharacter.spellIds.length > 0) {
        console.log(`${currentCharacter.name} has the following spells assigned:`);
        currentCharacter.spellIds.forEach(spellId => {
          const spell = spells.find(spell => spell.id === spellId);
          if (spell) {
            console.log(`- ${spell.name}`);
          }
        });
      } else {
        console.log(`${currentCharacter.name} has no spells assigned.`);
      }

      if (distance === 1) {
        console.log(`${currentCharacter.name} attacks ${closestEnemy.name}`);
        performAttack(currentCharacter, closestEnemy);
      } else {
        moveNpcTowardsEnemy(currentCharacter, closestEnemy);
      }
    }
  }
};
// Finds the closest enemy to the NPC
const findClosestEnemy = (npc, opposingTeam) => {
  let closestEnemy = null;
  let minDistance = Infinity;

  opposingTeam.forEach((enemy) => {
    if (currentHealth[enemy.id] > 0) { // Ensure enemy is alive
      const enemyPosition = positions[enemy.id];
      const npcPosition = positions[npc.id];
      const distance = Math.abs(npcPosition.row - enemyPosition.row) + Math.abs(npcPosition.col - enemyPosition.col);

      if (distance < minDistance) {
        minDistance = distance;
        closestEnemy = enemy;
      }
    }
  });

  return closestEnemy;
};


const performAttack = (attacker, target) => {
  const weapon = getWeaponById(attacker.weaponId);

  if (weapon) {
    showNotification(`${attacker.name} is attacking with ${weapon.name}`);
  }

  // Roll a d20 for attack roll
  const d20Roll = Math.floor(Math.random() * 20) + 1;
  const attackBonus = combineStats(
    races.find(race => race.id === attacker.raceId)?.attackBonus || 0,
    classes.find(clas => clas.id === attacker.classId)?.attackBonus || 0
  );

  const totalAttack = d20Roll + attackBonus;
  const targetArmorClass = combineStats(
    races.find(race => race.id === target.raceId)?.armorClass || 0,
    classes.find(clas => clas.id === target.classId)?.armorClass || 0
  );

  if (totalAttack >= targetArmorClass) {
    const diceType = weapon ? weapon.diceType : 'd6'; // Default to d6
    const diceSides = parseInt(diceType.replace('d', ''), 10) || 6;
    const weaponDamage = rollDice(diceSides);

    const attackPower = combineStats(
      races.find(race => race.id === attacker.raceId)?.attackPower || 0,
      classes.find(clas => clas.id === attacker.classId)?.attackPower || 0
    );

    const totalDamage = weaponDamage + attackPower;

    showNotification(`Hit! ${attacker.name} dealt ${totalDamage} damage to ${target.name}`);

    // Update target's health
    setCurrentHealth(prevHealth => ({
      ...prevHealth,
      [target.id]: Math.max(prevHealth[target.id] - totalDamage, 0),
    }));
  } else {
    showNotification(`${attacker.name} missed the attack on ${target.name}`);
  }
};
const moveNpcTowardsEnemy = (npc, enemy) => {
  const npcPosition = positions[npc.id];
  const enemyPosition = positions[enemy.id];

  const speedInSquares = getCharacterSpeedInSquares(npc.id); // Get NPC's speed in squares

  // All possible positions around the enemy
  const surroundingSquares = [
    { row: enemyPosition.row - 1, col: enemyPosition.col }, // Above
    { row: enemyPosition.row + 1, col: enemyPosition.col }, // Below
    { row: enemyPosition.row, col: enemyPosition.col - 1 }, // Left
    { row: enemyPosition.row, col: enemyPosition.col + 1 }, // Right
  ];

  // Filter and sort surrounding squares by distance from NPC
  const validSurroundingSquares = surroundingSquares
    .filter(({ row, col }) => !isSquareOccupied(row, col)) // Ensure square is not occupied
    .sort((a, b) => {
      const distA = Math.abs(a.row - npcPosition.row) + Math.abs(a.col - npcPosition.col);
      const distB = Math.abs(b.row - npcPosition.row) + Math.abs(b.col - npcPosition.col);
      return distA - distB; // Sort by proximity to NPC
    });

  if (validSurroundingSquares.length > 0) {
    // Move to the closest valid surrounding square
    const { row: targetRow, col: targetCol } = validSurroundingSquares[0];
    const path = findPath([npcPosition.row, npcPosition.col], [targetRow, targetCol]);

    if (path && path.length > 1) {
      let nextPositionIndex = Math.min(path.length - 1, speedInSquares); // Limit movement to NPC's speed
      const [newRow, newCol] = path[nextPositionIndex];

      if (!isSquareOccupied(newRow, newCol)) { // Ensure target square is not occupied
        setPositions(prevPositions => ({
          ...prevPositions,
          [npc.id]: { row: newRow, col: newCol },
        }));

        console.log(`${npc.name} moved to (${newRow}, ${newCol}) to surround ${enemy.name}`);
      } else {
        console.log(`${npc.name} could not move to (${newRow}, ${newCol}) as it is occupied.`);
      }
    } else {
      console.log(`${npc.name} has no valid path to move.`);
    }
  } else {
    // No valid surrounding square, fallback to path-based movement
    const path = findPath([npcPosition.row, npcPosition.col], [enemyPosition.row, enemyPosition.col]);

    if (path && path.length > 1) {
      let nextPositionIndex = Math.min(path.length - 1, speedInSquares); // Limit movement to NPC's speed
      const [newRow, newCol] = path[nextPositionIndex];

      if (!isSquareOccupied(newRow, newCol)) { // Ensure target square is not occupied
        setPositions(prevPositions => ({
          ...prevPositions,
          [npc.id]: { row: newRow, col: newCol },
        }));

        console.log(`${npc.name} moved to (${newRow}, ${newCol}).`);
      } else {
        console.log(`${npc.name} could not move to (${newRow}, ${newCol}) as it is occupied.`);
      }
    } else {
      console.log(`${npc.name} has no valid path to move.`);
    }
  }
};

// Helper function to check if a square is occupied
const isSquareOccupied = (row, col) => {
  return Object.values(positions).some(position => position.row === row && position.col === col);
};


 
// Update the current turn logic to check for NPCs
const handleEndTurn = () => {
  if (initiativeOrder.length > 0) {
    let nextIndex = (currentTurnIndex + 1) % initiativeOrder.length;

    // Loop until we find a character with health > 0
    while (currentHealth[characters[initiativeOrder[nextIndex]?.index]?.id] <= 0) {
      nextIndex = (nextIndex + 1) % initiativeOrder.length;
    }

    setCurrentTurnIndex(nextIndex);
    resetModes();

    const currentCharacterId = characters[initiativeOrder[nextIndex]?.index]?.id;
    const currentCharacter = characters.find(char => char.id === currentCharacterId);

    // If it's an NPC's turn, handle movement
    if (currentCharacter.isNpc) {
      handleNpcTurn(currentCharacter);
    }

    // Set a state to indicate if the current character is an NPC (this will be used to conditionally render NPC info)
    setIsNpcTurn(currentCharacter.isNpc);

    // Reset actionPerformed flag for the next turn
    setActionPerformed(prev => ({ ...prev, [currentCharacterId]: false }));
      // Decrement slow effect duration
      if (slowedCharacters[currentCharacterId] > 0) {
        setSlowedCharacters(prev => ({
          ...prev,
          [currentCharacterId]: prev[currentCharacterId] - 1,
        }));
      }
  
      // Handle DoT (damage over time) effect like acid
      const dotEffect = activeEffects[currentCharacterId]?.acid;
      if (dotEffect) {
        const damageRoll = rollDice(parseInt(dotEffect.damageType.replace('d', ''), 10));
        setCurrentHealth(prevHealth => ({
          ...prevHealth,
          [currentCharacterId]: Math.max(prevHealth[currentCharacterId] - damageRoll, 0)
        }));
        showNotification(`Taking acid damage over time: ${damageRoll}`);
      
        // Update DoT rounds
        if (dotEffect.rounds > 1) {
          setActiveEffects(prev => ({
            ...prev,
            [currentCharacterId]: {
              ...prev[currentCharacterId],
              acid: { ...dotEffect, rounds: dotEffect.rounds - 1 }
            }
          }));
        } else {
          setActiveEffects(prev => {
            const { acid, ...rest } = prev[currentCharacterId];
            return { ...prev, [currentCharacterId]: rest };
          });
        }
      }
  
      // Handle unheal effect
      const unhealEffect = activeEffects[currentCharacterId]?.unheal;
      if (unhealEffect) {
        // Decrement unheal effect
        if (unhealEffect.rounds > 1) {
          setActiveEffects(prev => ({
            ...prev,
            [currentCharacterId]: {
              ...prev[currentCharacterId],
              unheal: { ...unhealEffect, rounds: unhealEffect.rounds - 1 }
            }
          }));
        } else {
          setActiveEffects(prev => {
            const { unheal, ...rest } = prev[currentCharacterId];
            return { ...prev, [currentCharacterId]: rest };
          });
        }
      }
  
      // Decrement spell cooldowns
      if (spellCooldowns[currentCharacterId]) {
        const updatedCooldowns = Object.keys(spellCooldowns[currentCharacterId]).reduce((acc, spellId) => {
          const remainingCooldown = spellCooldowns[currentCharacterId][spellId] - 1;
          if (remainingCooldown > 0) {
            acc[spellId] = remainingCooldown;
          }
          return acc;
        }, {});
  
        setSpellCooldowns(prev => ({
          ...prev,
          [currentCharacterId]: updatedCooldowns
        }));
      }
  
      // Increase round count if we've cycled through all characters
      if (nextIndex === 0) {
        setRound(prevRound => prevRound + 1);
      }
    }
  };

  useEffect(() => {
    // Reset remaining movement at the start of a new turn
    const currentCharacterId = characters[initiativeOrder[currentTurnIndex]?.index]?.id;
    const currentCharacter = characters.find(char => char.id === currentCharacterId);
    setRemainingMovement(currentCharacter?.speed || 30); // Default speed is 30 feet if not set
  }, [currentTurnIndex, characters, initiativeOrder]);

  
  const handleMoveClick = () => {
    resetModes(); // Reset other modes
    setIsMoveMode(!isMoveMode); // Toggle move mode
  };

  const handleAttackClick = () => {
    resetModes(); // Reset other modes
    setIsAttackMode(!isAttackMode); // Toggle attack mode
  };
 
  useEffect(() => {
    const currentCharacterId = characters[initiativeOrder[currentTurnIndex]?.index]?.id;
    const currentCharacter = characters.find(char => char.id === currentCharacterId);

    // Reset doubled movement effect at the start of a new turn
    setIsMovementDoubled(false);
    setRemainingMovement(currentCharacter?.speed || 30); // Default speed is 30 feet if not set
}, [currentTurnIndex, characters, initiativeOrder]);

  
const handleSquareClick = (row, col) => {
  const currentCharacterId = characters[initiativeOrder[currentTurnIndex]?.index]?.id;
  const currentPosition = positions[currentCharacterId];
  

  if (selectedSpell) {
    // Prevent multiple spell casts in a single turn
    if (actionPerformed[currentCharacterId]) {
      showNotification('You can only cast one spell per turn!');
      return;
    }
  
    // Movement spell logic
    if (selectedSpell.effects.includes('movement')) {
      // Check cooldown
      if (spellCooldowns[currentCharacterId]?.[selectedSpell.id] > 0) {
        showNotification(`Spell is on cooldown for ${spellCooldowns[currentCharacterId][selectedSpell.id]} round(s)!`);
        return;
      }
  
      const cooldownRounds = selectedSpell.cooldown;
      if (cooldownRounds && cooldownRounds > 0) {
        setSpellCooldowns(prev => ({
          ...prev,
          [currentCharacterId]: {
            ...prev[currentCharacterId],
            [selectedSpell.id]: cooldownRounds,
          },
        }));
      }
  
      setRemainingMovement(prev => prev / 2); // Apply movement effect
      setSelectedSpell(null); // Clear selected spell
      setActionPerformed(prev => ({ ...prev, [currentCharacterId]: true })); // Mark action as performed
      return;
    }
  
    // Check for spell cooldown
    if (spellCooldowns[currentCharacterId]?.[selectedSpell.id] !== undefined) {
      showNotification(`Spell is on cooldown for ${spellCooldowns[currentCharacterId][selectedSpell.id]} round(s)!`);
      return;
    }
  
    resetModes();
  
    const targetCharacter = characters.find(
      char => positions[char.id]?.row === row && positions[char.id]?.col === col
    );
  


// Apply 'unheal' effect with damage
if (selectedSpell.effects.includes('unheal') && targetCharacter) {
  const distance = Math.max(
    Math.abs(currentPosition.row - row),
    Math.abs(currentPosition.col - col)
  );

  const spellRangeInFeet = Number(selectedSpell.spellRange);
  const spellRangeInSquares = spellRangeInFeet / 5;

  if (distance <= spellRangeInSquares) {
    const attacker = characters.find(character => character.id === currentCharacterId);
    const toHitBonus = combineStats(
      races.find(race => race.id === attacker.raceId)?.spellAttack || 0,
      classes.find(clas => clas.id === attacker.classId)?.spellAttack || 0
    );

    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const toHitRoll = d20Roll + toHitBonus;

    const targetArmorClass = combineStats(
      races.find(race => race.id === targetCharacter.raceId)?.armorClass || 0,
      classes.find(clas => clas.id === targetCharacter.classId)?.armorClass || 0
    );

    showNotification(`Rolled: ${d20Roll} + To Hit Bonus: ${toHitRoll - d20Roll} = ${toHitRoll}. Target Armor Class: ${targetArmorClass}`);

    // Check if the roll hits
    if (toHitRoll >= targetArmorClass) {
      const damageRoll = rollDice(parseInt(selectedSpell.diceType.replace('d', ''), 10));
      const damageBonus = combineStats(
        races.find(race => race.id === attacker.raceId)?.attackPower || 0,
        classes.find(clas => clas.id === attacker.classId)?.attackPower || 0
      );

      const totalDamage = damageRoll + damageBonus;

      setCurrentHealth(prevHealth => ({
        ...prevHealth,
        [targetCharacter.id]: Math.max(prevHealth[targetCharacter.id] - totalDamage, 0)
      }));

      showNotification(`${targetCharacter.name} took ${totalDamage} damage from the 'unheal' spell!`);

      setActiveEffects(prev => ({
        ...prev,
        [targetCharacter.id]: {
          ...prev[targetCharacter.id],
          unheal: { rounds: 3 } // Set 'unheal' effect for 3 rounds
        }
      }));
      showNotification(`${targetCharacter.name} is affected by 'unheal' for 3 rounds!`);
    } else {
      showNotification(`${targetCharacter.name} was missed by the 'unheal' spell!`);
    }

    // Apply cooldown regardless of hit or miss
    const cooldownRounds = selectedSpell.cooldown;
    if (cooldownRounds && cooldownRounds > 0) {
      setSpellCooldowns(prev => ({
        ...prev,
        [currentCharacterId]: {
          ...prev[currentCharacterId],
          [selectedSpell.id]: cooldownRounds,
        },
      }));
    }

    // Mark the action as performed for this character
    setActionPerformed(prev => ({ ...prev, [currentCharacterId]: true }));

    setSelectedSpell(null); // Clear selected spell after processing
    return;
  } else {
    showNotification(`Target is too far away for '${selectedSpell.name}'!`);
    return;
  }
}

// Healing the character who clicked the spell (self-heal logic)
if (selectedSpell.spellRange === 'Self' && selectedSpell.effects.includes('heal')) {
  const healAmount = rollDice(parseInt(selectedSpell.diceType.replace('d', ''), 10));
  const currentHealthValue = currentHealth[currentCharacterId] || 0;
  const totalHealth = combineStats(
    races.find(race => race.id === characters.find(char => char.id === currentCharacterId).raceId)?.health || 0,
    classes.find(clas => clas.id === characters.find(char => char.id === currentCharacterId).classId)?.health || 0
  );

  const newHealth = Math.min(currentHealthValue + healAmount, totalHealth);
  setCurrentHealth(prev => ({ ...prev, [currentCharacterId]: newHealth }));
  showNotification(
    `Healed ${characters.find(char => char.id === currentCharacterId).name} for ${healAmount} health! Total health: ${newHealth}`
  );

  const cooldownRounds = selectedSpell.cooldown;
  if (cooldownRounds && cooldownRounds > 0) {
    setSpellCooldowns(prev => ({
      ...prev,
      [currentCharacterId]: {
        ...prev[currentCharacterId],
        [selectedSpell.id]: cooldownRounds,
      },
    }));
  }

  // Mark the action as performed for this character
  setActionPerformed(prev => ({ ...prev, [currentCharacterId]: true }));

  setSelectedSpell(null);
  return;
}
// Healing another character logic
if (selectedSpell.spellRange !== 'Self' && selectedSpell.effects.includes('heal')) {
  if (targetCharacter) {
    const distance = Math.abs(currentPosition.row - row) + Math.abs(currentPosition.col - col);
    const spellRangeInFeet = Number(selectedSpell.spellRange);
    const spellRangeInSquares = spellRangeInFeet / 5;

    if (activeEffects[targetCharacter.id]?.unheal) {
      showNotification(`Cannot heal ${targetCharacter.name} due to 'unheal' effect!`);
      return;
    }

    if (distance <= spellRangeInSquares) {
      const healAmount = rollDice(parseInt(selectedSpell.diceType.replace('d', ''), 10));
      const currentHealthValue = currentHealth[targetCharacter.id] || 0;
      const totalHealth = combineStats(
        races.find(race => race.id === targetCharacter.raceId)?.health || 0,
        classes.find(clas => clas.id === targetCharacter.classId)?.health || 0
      );

      const newHealth = Math.min(currentHealthValue + healAmount, totalHealth);
      setCurrentHealth(prev => ({ ...prev, [targetCharacter.id]: newHealth }));
      showNotification(`Healed ${targetCharacter.name} for ${healAmount} health! Total health: ${newHealth}`);

      // Apply cooldown for the selected spell
      const cooldownRounds = selectedSpell.cooldown;
      if (cooldownRounds && cooldownRounds > 0) {
        setSpellCooldowns(prev => ({
          ...prev,
          [currentCharacterId]: {
            ...prev[currentCharacterId],
            [selectedSpell.id]: cooldownRounds,
          },
        }));
      }

      // Mark action as performed for the current character
      setActionPerformed(prev => ({ ...prev, [currentCharacterId]: true }));

      setSelectedSpell(null);
      return;
    } else {
      showNotification(`Target is too far away for '${selectedSpell.name}'!`);
    }
    return;
  } else {
    showNotification('No valid target in this square!');
  }
}
    // Spell attack logic
   
 // Spell attack logic
if (selectedSpell) {
  // Check if spell attack is selected and action has not been performed
  if (!actionPerformed[currentCharacterId]) {
    // AoE spell logic
    if (selectedSpell.isAoE === 1) {
      const spellRangeInSquares = selectedSpell.spellRange / 5;
      const distance = Math.abs(currentPosition.row - row) + Math.abs(currentPosition.col - col);

      // Check if the clicked square is within range
      if (distance <= spellRangeInSquares) {
        // Check if the clicked square is in line of sight
        if (!hasLineOfSight([currentPosition.row, currentPosition.col], [row, col])) {
          showNotification(`Selected square is not within line of sight.`);
          return;
        }

        // Set action as performed only after checking range and line of sight
        setActionPerformed(prev => ({ ...prev, [currentCharacterId]: true }));

        // Calculate the AoE radius in terms of grid squares
        const aoeRadiusInSquares = Math.floor(selectedSpell.aoeRadius / 5); // Convert radius to squares

        // Find all squares within AoE radius
        const affectedSquares = [];
        for (let r = row - aoeRadiusInSquares; r <= row + aoeRadiusInSquares; r++) {
          for (let c = col - aoeRadiusInSquares; c <= col + aoeRadiusInSquares; c++) {
            affectedSquares.push({ row: r, col: c });
          }
        }

        // Check if any characters are in the AoE and apply the spell logic to them
        const affectedCharacters = characters.filter(char =>
          affectedSquares.some(sq =>
            positions[char.id]?.row === sq.row && positions[char.id]?.col === sq.col
          )
        );

        if (affectedCharacters.length > 0) {
          affectedCharacters.forEach((character) => {
            // Check line of sight for each character before applying the spell
            if (!hasLineOfSight([currentPosition.row, currentPosition.col], [positions[character.id]?.row, positions[character.id]?.col])) {
              showNotification(`${character.name} is behind a wall and cannot be affected by the spell.`);
              return; // Skip this character if they are behind a wall
            }

            // Roll attack and apply damage as before
            const attacker = characters.find(character => character.id === currentCharacterId);
            const isAbilitySpell = selectedSpell.damageType === 'ability';

            const toHitBonus = combineStats(
              races.find(race => race.id === attacker.raceId)?.[isAbilitySpell ? 'attackBonus' : 'spellAttack'] || 0,
              classes.find(clas => clas.id === attacker.classId)?.[isAbilitySpell ? 'attackBonus' : 'spellAttack'] || 0
            );

            const damageBonus = combineStats(
              races.find(race => race.id === attacker.raceId)?.[isAbilitySpell ? 'attackPower' : 'spellPower'] || 0,
              classes.find(clas => clas.id === attacker.classId)?.[isAbilitySpell ? 'attackPower' : 'spellPower'] || 0
            );

            const d20Roll = Math.floor(Math.random() * 20) + 1;
            const toHitRoll = d20Roll + toHitBonus;

            const targetArmorClass = combineStats(
              races.find(race => race.id === character.raceId)?.armorClass || 0,
              classes.find(clas => clas.id === character.classId)?.armorClass || 0
            );

            showNotification(`Rolled: ${d20Roll} + To Hit Bonus: ${toHitRoll - d20Roll} = ${toHitRoll}. Target Armor Class: ${targetArmorClass}`);

            if (toHitRoll >= targetArmorClass) {
              const damageRoll = rollDice(parseInt(selectedSpell.diceType.replace('d', ''), 10));
              const initialDamage = damageRoll + damageBonus;

              setCurrentHealth(prevHealth => ({
                ...prevHealth,
                [character.id]: Math.max(prevHealth[character.id] - initialDamage, 0)
              }));
              showNotification(`${character.name} took ${initialDamage} damage!`);

              if (selectedSpell.effects.includes('slow') || selectedSpell.damageType === 'cold') {
                setSlowedCharacters(prev => ({
                  ...prev,
                  [character.id]: 2,  // Set to 2 turns of slow
                }));
                showNotification(`${character.name} is slowed for 2 turns!`);
              }

              if (selectedSpell.effects.includes('unheal')) {
                showNotification(`${character.name} has been affected by the 'unheal' spell!`);
              }
            } else {
              showNotification(`${character.name} was missed by the spell!`);
            }
          });
        } else {
          showNotification("No characters in the AoE.");
        }

        // Set spell cooldown if applicable
        const cooldownRounds = selectedSpell.cooldown;
        if (cooldownRounds && cooldownRounds > 0) {
          setSpellCooldowns(prev => ({
            ...prev,
            [currentCharacterId]: {
              ...prev[currentCharacterId],
              [selectedSpell.id]: cooldownRounds,
            },
          }));
        }

        setSelectedSpell(null); // Clear selected spell after AoE cast
        return;
      } else {
        showNotification(`Selected square is out of range for '${selectedSpell.name}'.`);
        return;
      }
    }
  }

// Single-target spell logic
if (targetCharacter && !actionPerformed[currentCharacterId]) {
  const rowDiff = Math.abs(currentPosition.row - row);
  const colDiff = Math.abs(currentPosition.col - col);
  const diagonalMoves = Math.min(rowDiff, colDiff);
  const straightMoves = Math.abs(rowDiff - colDiff);
  const totalDistanceInSquares = diagonalMoves + straightMoves;

  const spellRangeInFeet = Number(selectedSpell.spellRange);
  const spellRangeInSquares = spellRangeInFeet / 5;

  if (totalDistanceInSquares <= spellRangeInSquares) {
    const start = [currentPosition.row, currentPosition.col];
    const end = [row, col];

    if (!hasLineOfSight(start, end)) {
      showNotification(`Line of sight is blocked by a wall. Cannot cast '${selectedSpell.name}'.`);
      return;
    }

    setActionPerformed((prev) => ({ ...prev, [currentCharacterId]: true }));

    const attacker = characters.find((character) => character.id === currentCharacterId);
    const isAbilitySpell = selectedSpell.damageType === 'ability';

    const toHitBonus = combineStats(
      races.find((race) => race.id === attacker.raceId)?.[isAbilitySpell ? 'attackBonus' : 'spellAttack'] || 0,
      classes.find((clas) => clas.id === attacker.classId)?.[isAbilitySpell ? 'attackBonus' : 'spellAttack'] || 0
    );

    const damageBonus = combineStats(
      races.find((race) => race.id === attacker.raceId)?.[isAbilitySpell ? 'attackPower' : 'spellPower'] || 0,
      classes.find((clas) => clas.id === attacker.classId)?.[isAbilitySpell ? 'attackPower' : 'spellPower'] || 0
    );

    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const toHitRoll = d20Roll + toHitBonus;

    const targetArmorClass = combineStats(
      races.find((race) => race.id === targetCharacter.raceId)?.armorClass || 0,
      classes.find((clas) => clas.id === targetCharacter.classId)?.armorClass || 0
    );

    showNotification(`Rolled: ${d20Roll} + To Hit Bonus: ${toHitRoll - d20Roll} = ${toHitRoll}. Target Armor Class: ${targetArmorClass}`);

    if (toHitRoll >= targetArmorClass) {
      const damageRoll = rollDice(parseInt(selectedSpell.diceType.replace('d', ''), 10));
      const initialDamage = damageRoll + damageBonus;

      setCurrentHealth((prevHealth) => ({
        ...prevHealth,
        [targetCharacter.id]: Math.max(prevHealth[targetCharacter.id] - initialDamage, 0),
      }));
      showNotification(`Spell hit! Initial Damage: ${initialDamage}`);

      if (selectedSpell.effects.includes('slow') || selectedSpell.damageType === 'cold') {
        setSlowedCharacters((prev) => ({
          ...prev,
          [targetCharacter.id]: 2,
        }));
        showNotification(`${targetCharacter.name} is slowed for 2 turns!`);
      }

      if (selectedSpell.effects.includes('unheal')) {
        showNotification(`${targetCharacter.name} has been affected by the 'unheal' spell!`);
      }
    } else {
      showNotification('Spell missed!');
    }

    if (selectedSpell.cooldown > 0) {
      setSpellCooldowns((prev) => ({
        ...prev,
        [currentCharacterId]: {
          ...prev[currentCharacterId],
          [selectedSpell.id]: selectedSpell.cooldown,
        },
      }));
    }

    setSelectedSpell(null);
  } else {
    showNotification(`Target is out of range for '${selectedSpell.name}'.`);
  }
}
}
};
if (isMoveMode && currentCharacterId && currentPosition) {
  resetModes();

  // Recalculate effective movement based on slowed or doubled movement
  let effectiveMovement = remainingMovement;
  if (slowedCharacters[currentCharacterId] > 0) {
    effectiveMovement = Math.floor(remainingMovement / 2); // Halve the movement if slowed
  } else if (isMovementDoubled) {
    effectiveMovement = remainingMovement * 2; // Double the movement if spell is active
  }

  // Use pathfinding to check if the move is possible
  const start = [currentPosition.row, currentPosition.col];
  const end = [row, col];
  const path = findPath(start, end);

  if (path) {
    const pathLength = path.length - 1; // Actual number of steps
    const distanceInFeet = pathLength * 5;

    if (distanceInFeet <= effectiveMovement) {
      setPositions(prevPositions => ({
        ...prevPositions,
        [currentCharacterId]: { row, col },
      }));

      setRemainingMovement(prev => Math.max(0, prev - distanceInFeet));
      setValidMoveSquares([]); // Clear highlights
    } else {
      showNotification('Cannot move that far due to movement restrictions.');
    }
  } else {
    showNotification('No valid path found to the target location.');
  }
}

// Attack mode logic
else if (isAttackMode && currentCharacterId && !actionPerformed[currentCharacterId]) {
  const targetCharacter = characters.find(
    char => positions[char.id]?.row === row && positions[char.id]?.col === col
  );

  if (targetCharacter) {
    const distance = Math.abs(currentPosition.row - row) + Math.abs(currentPosition.col - col);
    if (
      distance === 1 ||
      (distance === 2 && Math.abs(currentPosition.row - row) === 1 && Math.abs(currentPosition.col - col) === 1)
    ) {
      // Mark action as performed for current character
      setActionPerformed(prev => ({ ...prev, [currentCharacterId]: true }));

      // Handle attack
      const attacker = characters.find(character => character.id === currentCharacterId);
      const target = characters.find(character => character.id === targetCharacter.id);

      if (!attacker || !target) return;

      const weapon = getWeaponById(attacker.weaponId);

      if (weapon) {
        showNotification(`Attacker is using: ${weapon.name} with Dice Type: ${weapon.diceType}`);
      } else {
        showNotification('No weapon found for this character!');
      }

      // Roll a d20 for attack roll
      const d20Roll = Math.floor(Math.random() * 20) + 1;
      const attackBonus = combineStats(
        races.find(race => race.id === attacker.raceId)?.attackBonus || 0,
        classes.find(clas => clas.id === attacker.classId)?.attackBonus || 0
      );

      const totalAttack = d20Roll + attackBonus;
      const targetArmorClass = combineStats(
        races.find(race => race.id === target.raceId)?.armorClass || 0,
        classes.find(clas => clas.id === target.classId)?.armorClass || 0
      );

      showNotification(`Rolled: ${d20Roll} + Attack Bonus: ${attackBonus} = ${totalAttack}. Target Armor Class: ${targetArmorClass}`);

      if (totalAttack >= targetArmorClass) {
        const diceType = weapon ? weapon.diceType : 'd6'; // Default to d6 if no weapon
        const diceSides = parseInt(diceType.replace('d', ''), 10) || 6;
        const weaponDamage = rollDice(diceSides);

        const attackPower = combineStats(
          races.find(race => race.id === attacker.raceId)?.attackPower || 0,
          classes.find(clas => clas.id === attacker.classId)?.attackPower || 0
        );

        const totalDamage = weaponDamage + attackPower;

        showNotification(
          `Hit! Used Weapon: ${weapon?.name || 'Unknown'} with Dice Type: ${diceType}, Rolled Weapon Damage: ${weaponDamage} + Attack Power: ${attackPower} = Total Damage: ${totalDamage}`
        );

        // Update health of the target character
        setCurrentHealth(prevHealth => ({
          ...prevHealth,
          [targetCharacter.id]: Math.max(prevHealth[targetCharacter.id] - totalDamage, 0),
        }));

        // Remove character if health is <= 0
        const remainingCharacters = characters.filter(character => currentHealth[character.id] > 0);

        // Update characters array with remaining characters
        characters = remainingCharacters;
      } else {
        showNotification('Attack missed!');
      }

      setIsAttackMode(false); // Turn off attack mode after action
    } else {
      showNotification('Target is too far away!');
    }
  }
}
};

// Roll dice function
const rollDice = (sides) => {
    return Math.floor(Math.random() * sides) + 1;
};

const highlightValidSquares = useCallback(() => {
  const currentCharacterId = characters[initiativeOrder[currentTurnIndex]?.index]?.id;
  const currentPosition = positions[currentCharacterId];

  if (currentCharacterId && currentPosition) {
    const validSquares = []; // Initialize the valid squares array

    // Use effective movement based on isMovementDoubled or slowed status
    let effectiveMovement = remainingMovement;
    if (slowedCharacters[currentCharacterId] > 0) {
      effectiveMovement = Math.floor(remainingMovement / 2); // Halve movement if slowed
    } else if (isMovementDoubled) {
      effectiveMovement = remainingMovement * 2; // Double movement if spell is active
    }

    // Convert movement to distance in feet
    const distanceInFeet = effectiveMovement;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Calculate the path to the square
        const start = [currentPosition.row, currentPosition.col];
        const end = [row, col];
        const path = findPath(start, end);

        if (path) {
          const pathLength = path.length - 1; // Actual number of steps
          const totalDistanceInFeet = pathLength * 5;

          // Check if the path length is within the effective movement range
          if (totalDistanceInFeet <= distanceInFeet) {
            validSquares.push({ row, col });
          }
        }
      }
    }

    setValidMoveSquares(validSquares);
  }
}, [characters, initiativeOrder, positions, rows, columns, remainingMovement, currentTurnIndex, isMovementDoubled, slowedCharacters, findPath]);

  const highlightValidAttackSquares = useCallback(() => {
    const currentCharacterId = characters[initiativeOrder[currentTurnIndex]?.index]?.id;
    const currentPosition = positions[currentCharacterId];
  
    if (currentCharacterId && currentPosition) {
      const validSquares = []; // Initialize the valid squares array
  
      // Check all adjacent squares including diagonals
      for (let row = -1; row <= 1; row++) {
        for (let col = -1; col <= 1; col++) {
          // Skip the center square (current position)
          if (row === 0 && col === 0) continue;
  
          const targetRow = currentPosition.row + row;
          const targetCol = currentPosition.col + col;
  
          // Ensure the target square is within the grid boundaries
          if (targetRow >= 0 && targetRow < rows && targetCol >= 0 && targetCol < columns) {
            validSquares.push({ row: targetRow, col: targetCol });
          }
        }
      }
  
      setValidAttackSquares(validSquares);
    }
  }, [characters, initiativeOrder, positions, rows, columns, currentTurnIndex]);
  
  const highlightSpellRange = useCallback(() => {
    if (!selectedSpell) return;
  
    const currentCharacterId = characters[initiativeOrder[currentTurnIndex]?.index]?.id;
    const currentPosition = positions[currentCharacterId];
  
    if (currentCharacterId && currentPosition) {
      const validSquares = [];
      const spellRangeInFeet = Number(selectedSpell.spellRange);
      const spellRangeInSquares = spellRangeInFeet / 5;
  
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const rowDiff = Math.abs(currentPosition.row - row);
          const colDiff = Math.abs(currentPosition.col - col);
          const diagonalMoves = Math.min(rowDiff, colDiff);
          const straightMoves = Math.abs(rowDiff - colDiff);
  
          // Calculate total distance considering diagonal movement
          const totalDistanceInSquares = diagonalMoves + straightMoves;
  
          // If the total distance is within the spell's range, mark the square as valid
          if (totalDistanceInSquares <= spellRangeInSquares) {
            validSquares.push({ row, col });
          }
        }
      }
  
      setValidMoveSquares(validSquares); // Highlight normal spell range
    }
  }, [characters, initiativeOrder, positions, rows, columns, currentTurnIndex, selectedSpell]);

// useEffect to call highlightSpellRange when selectedSpell changes
useEffect(() => {
    if (selectedSpell) {
        highlightSpellRange();
    }
}, [selectedSpell, highlightSpellRange]);



const highlightAoERadius = useCallback((centerRow, centerCol) => {
  if (!selectedSpell || selectedSpell.isAoE !== 1) return;

  const aoeRadiusInSquares = Math.floor(selectedSpell.aoeRadius / 5);
  const aoeSquares = [];

  // Loop through all possible affected squares within the AoE radius
  for (let row = centerRow - aoeRadiusInSquares; row <= centerRow + aoeRadiusInSquares; row++) {
    for (let col = centerCol - aoeRadiusInSquares; col <= centerCol + aoeRadiusInSquares; col++) {
      // Only include squares within the radius (square AoE shape)
      const rowOffset = Math.abs(centerRow - row);
      const colOffset = Math.abs(centerCol - col);

      if (rowOffset <= aoeRadiusInSquares && colOffset <= aoeRadiusInSquares) {
        // Check if square is within bounds
        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
          // Calculate index
          const index = row * gridSize + col;
          
          // Ensure square is not blocked by a wall and that line of sight is clear
          if (!isWall(index) && hasLineOfSight([centerRow, centerCol], [row, col])) {
            aoeSquares.push({ row, col });
          }
        }
      }
    }
  }

  // Highlight only valid squares in AoE
  setAoeHighlightSquares(aoeSquares); 
}, [selectedSpell, isWall, gridSize, hasLineOfSight]);

const clearAoEHighlight = useCallback(() => {
  setAoeHighlightSquares([]); // Clear AoE highlight when not hovering over a square
}, []);


const highlightSingleSquare = useCallback((row, col) => {
  // Check if the square is within the valid movement range
  const isWithinMovementRange = validMoveSquares.some(square => square.row === row && square.col === col);

  // If within range, set the hovered square for highlighting
  if (isWithinMovementRange) {
    setHoveredSquare({ row, col });
  } else {
    setHoveredSquare(null); // Clear highlight if out of range
  }
}, [validMoveSquares]);

const clearHoveredSquare = useCallback(() => {
  setHoveredSquare(null); // Clear the hovered square when mouse leaves
}, []);




  useEffect(() => {
    if (isMoveMode) {
      highlightValidSquares();
    } else {
      setValidMoveSquares([]);
    }
  }, [isMoveMode, highlightValidSquares]);

  useEffect(() => {
    if (isAttackMode) {
      highlightValidAttackSquares();
    } else {
      setValidAttackSquares([]);
    }
  }, [isAttackMode, highlightValidAttackSquares]);
  
  if (!safeCharacters.length) {
    return <p>No characters available.</p>;
  }



  

  return (
    <div
      className="tilemaptwos-container"
      onClick={(e) => {
        // Toggle `isAttackMode`
        if (isAttackMode) {
          setIsAttackMode(false);
          e.stopPropagation(); // Prevent the full-screen action if disabling attack mode
          return;
        }
        handleEnterFullScreen(); // Existing full-screen logic
      }}
      ref={mapRef}
    >
      <button
        className="tilemaptwos-exit"
        onClick={(e) => {
          e.stopPropagation();
          onExit();
        }}
      >
        X
      </button>
  
      {showRollInitiativeOverlay && (
        <div className="initiative-overlay">
          <h2>Roll Initiative</h2>
          <button onClick={rollInitiative}>Roll Initiative</button>
        </div>
      )}
       
      {showWinnerOverlay && (
        <div className="winner-overlay">
          <h1>{winnerMessage}</h1>
        </div>
      )}
     

  
<div className="tilemaptwos-grid">
  {Array.from({ length: rows }, (_, rowIndex) => (
    <div className="tilemaptwos-row" key={rowIndex}>
      {Array.from({ length: columns }, (_, colIndex) => {
        // Calculate if this square is the hovered square
        const isHoveredSquare = hoveredSquare?.row === rowIndex && hoveredSquare?.col === colIndex;

        // Check if this square should have spell range, attack range, or AoE highlights
        const isValidMove = validMoveSquares.some(
          (square) => square.row === rowIndex && square.col === colIndex
        );

        const isInAttackRange = validAttackSquares.some(
          (square) => square.row === rowIndex && square.col === colIndex
        );

        const isInAoERange = aoeHighlightSquares.some(
          (square) => square.row === rowIndex && square.col === colIndex
        );

        // Filter out characters whose health is 0 or less
        const aliveCharacters = characters.filter(
          (char) => currentHealth[char.id] > 0 // Only keep characters with health > 0
        );

        // Find the character for the current square
        const character = aliveCharacters.find(
          (char) =>
            positions[char.id]?.row === rowIndex && positions[char.id]?.col === colIndex
        );

        const characterCurrentHP = character ? currentHealth[character.id] || 0 : 0;
        const totalHealth = character
          ? combineStats(
              races.find((race) => race.id === character.raceId)?.health || 0,
              classes.find((clas) => clas.id === character.classId)?.health || 0
            )
          : 0;

        // Check if this square is a wall
        const isThisWall = isWall(rowIndex * gridSize + colIndex);

        // Render each square with appropriate classes and styles
        return (
          <div
            className={`tilemaptwos-square
              ${isValidMove ? 'highlight' : ''}
              ${isInAoERange ? 'highlight-aoe' : ''}
              ${isHoveredSquare ? 'highlight-hovered' : ''}
              ${isThisWall ? 'wall' : ''}`}
            key={colIndex}
            style={isInAttackRange ? { backgroundColor: 'rgba(255, 0, 0, 0.2)' } : {}}
            onClick={(e) => {
              // Prevent interaction with walls
              if (isThisWall) {
                showNotification("Cannot move to a wall.");
                e.stopPropagation();
                return; // Do nothing if it's a wall
              }
              handleSquareClick(rowIndex, colIndex);
            }}
            onMouseEnter={() => {
              if (isThisWall) {
                return; // Do nothing if it's a wall
              }
              if (selectedSpell?.isAoE === 1) {
                highlightAoERadius(rowIndex, colIndex);
              } else {
                highlightSingleSquare(rowIndex, colIndex);
              }
            }}
            onMouseLeave={() => {
              clearAoEHighlight();
              clearHoveredSquare();
            }}
          >
            {character && (
              <>
                <div className="health-bar" style={{ width: (characterCurrentHP / totalHealth) * 100 + '%' }}>
                  <span className="health-text">{characterCurrentHP} / {totalHealth}</span>
                </div>
                <div className="token">
                  <div
                    className={`character-name ${
                      character.team === 'gold' ? 'gold-border' : character.team === 'green' ? 'green-border' : ''
                    }`}
                  >
                    {character.name}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  ))}
</div>
<div className="tilemaptwos-below">
  <div className="left-content">
    {raceData && classData && !isNpcTurn && (
      <div className="race-class-container">
        <div className="race-class-data">
          <p>Attack Bonus: {combineStats(raceData.attackBonus, classData.attackBonus)}</p>
          <p>Attack Power: {combineStats(raceData.attackPower, classData.attackPower)}</p>
          <p>Spell Attack: {combineStats(raceData.spellAttack, classData.spellAttack)}</p>
          <p>Spell Power: {combineStats(raceData.spellPower, classData.spellPower)}</p>
          <p>Health: {combineStats(raceData.health, classData.health)}</p>
          <p>Armor Class: {combineStats(raceData.armorClass, classData.armorClass)}</p>
          <p>Speed: {combineStats(raceData.speed, classData.speed)}</p>
        </div>
        <div className="action-buttons">
            <button onClick={handleAttackClick} className={`attack-button ${isAttackMode ? 'active' : ''}`}>
              <img src={attackImage} alt="Attack" />
            </button>
            <button onClick={handleMoveClick} className={`move-button ${isMoveMode ? 'active' : ''}`}>
              <img src={moveImage} alt="Move" />
            </button>
        </div>
      
    
        <h3>Spells:</h3>
        <div className="spell-details-container">
            <div className="spell-list">
                {(() => {
                    const currentCharacterIndex = initiativeOrder[currentTurnIndex]?.index;
                    const currentCharacterId = characters[currentCharacterIndex]?.id;

                    return selectedSpells[currentCharacterId]?.map((spellId) => {
                        const spell = spells.find((s) => s.id === spellId);
                        return spell ? (
                            <div
                                key={spell.id}
                                className={`spell-card ${selectedSpell?.id === spell.id ? 'selected' : ''}`}
                                onClick={() => {
                                    if (
                                        spellCooldowns[currentCharacterId]?.[spell.id] === undefined ||
                                        spellCooldowns[currentCharacterId][spell.id] === 0
                                    ) {
                                        handleSpellClick(spell);
                                    } else {
                                        showNotification(`Spell is on cooldown for ${spellCooldowns[currentCharacterId][spell.id]} round(s)!`);
                                    }
                                }}
                            >
                                <div className="spell-thumbnail">
                                    <img
                                        src={damageTypeImageMap[spell.damageType]}
                                        alt={spell.damageType}
                                        className="spell-image-thumbnail"
                                    />
                                    {spellCooldowns[currentCharacterId]?.[spell.id] > 0 && (
                                        <div className="cooldown-indicator">
                                            {spellCooldowns[currentCharacterId][spell.id]}
                                        </div>
                                    )}
                                </div>
                                <div className="spell-description">
                                    <p><strong>Name:</strong> {spell.name}</p>
                                    <p><strong>Description:</strong> {spell.description}</p>
                                    <p><strong>Dice Type:</strong> {spell.diceType}</p>
                                    <p><strong>Range:</strong> {spell.spellRange}</p>
                                    <p><strong>Effect:</strong> {Array.isArray(spell.effects) ? spell.effects.join(', ') : spell.effects}</p>
                                </div>
                            </div>
                        ) : null;
                    });
                })()}
            </div>
          {/* Place the action buttons below the spell list */}
         
        </div>
      </div>
    )}
  </div>

  
        <div className='center-name-and-button'>
          <h2 className='turn-name'>{characters[initiativeOrder[currentTurnIndex]?.index]?.name || 'No Characters'}</h2>
          <button className="end-turn-btn" onClick={handleEndTurn}>End Turn</button>
        </div>
  
        <div className="right-content">
  <h3>Initiative Order:</h3>
  <ul>
    {isInitiativeRolled && initiativeOrder.length > 0 ? (
      initiativeOrder.map((roll, index) => (
        <li key={index}>{roll.name} rolled {roll.roll}</li>
      ))
    ) : (
      <li>No characters in initiative order</li>
    )}
  </ul>
</div>
        <h3>Round: {round}</h3>
      </div>
      <Notifications />
    </div>
  );
};

export default TileMapTwos;