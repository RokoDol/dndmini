import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '../contexts/CharacterContext';
import './CharacterSelection.css';
import wizardToken from '../tokeni/wizardToken.png'; 
import paladinToken from '../tokeni/paladinToken.png';
import fighterToken from '../tokeni/fighterToken.png';

function CharacterSelection() {
    const [characters, setCharacters] = useState([]);
    const [classes, setClasses] = useState([]);
    const [races, setRaces] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { selectedCharacters, selectCharacter } = useCharacter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [characterResponse, classResponse, raceResponse] = await Promise.all([
                    axios.get('http://localhost:5000/characters/getCharacters'),
                    axios.get('http://localhost:5000/classes/getClasses'),
                    axios.get('http://localhost:5000/races/getRaces'),
                ]);
                
                console.log('Characters:', characterResponse.data); // Log character data
    
                // Filter out NPC characters (where isNpc is true)
                const filteredCharacters = characterResponse.data.filter((character) => !character.isNpc);
                setCharacters(filteredCharacters);
                setClasses(classResponse.data);
                setRaces(raceResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error fetching data.');
            }
        };
    
        fetchData();
    }, []);

    const classImageMap = {
        wizard: wizardToken,
        paladin: paladinToken,
        fighter: fighterToken,
    };

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

    const combineAttributes = (character) => {
        const race = getRaceById(character.raceId);
        const cls = getClassById(character.classId);

        const className = getClassNameById(character.classId).toLowerCase(); // Convert to lowercase
        console.log('Class Name:', className); // Log the class name
        
        return {
            name: race.name,
            attackBonus: (cls.attackBonus || 0) + (race.attackBonus || 0),
            attackPower: (cls.attackPower || 0) + (race.attackPower || 0),
            spellAttack: (cls.spellAttack || 0) + (race.spellAttack || 0),
            spellPower: (cls.spellPower || 0) + (race.spellPower || 0),
            health: (cls.health || 0) + (race.health || 0),
            armorClass: (cls.armorClass || 0) + (race.armorClass || 0),
            speed: race.speed || 0,
            classImage: classImageMap[className], // Ensure this key matches
        };
    };

    const handleCharacterSelect = (character) => {
        const combined = combineAttributes(character);
        selectCharacter({
            ...character,
            classImage: combined.classImage, // Include class image
        });
    };

    const handleBattleStart = () => {
        if (selectedCharacters.length === 2) {
            navigate('/spell-ability-selection', { state: { selectedCharacters } });
        } else {
            alert('Please select exactly 2 characters.');
        }
    };

    return (
        <div className="character-selection-container">
            <h2 className="character-selection-title">Select Two Characters for Battle</h2>
            {error && <p className="character-selection-error">{error}</p>}
            <div className="character-selection-grid">
                {characters.length > 0 ? (
                    characters.map((character) => {
                        const combined = combineAttributes(character);
                        const isSelected = selectedCharacters.some((selected) => selected.id === character.id);
                        return (
                            <div
                                className={`character-selection-item ${isSelected ? 'selected' : ''}`}
                                key={character.id}
                                onClick={() => handleCharacterSelect(character)}
                            >
                                <h3>{character.name}</h3>
                                <div><strong>Class:</strong> {getClassNameById(character.classId)}</div>
                                <div><strong>Race:</strong> {combined.name}</div>
                                <div><strong>Attack Bonus:</strong> {combined.attackBonus}</div>
                                <div><strong>Attack Power:</strong> {combined.attackPower}</div>
                                <div><strong>Spell Attack:</strong> {combined.spellAttack}</div>
                                <div><strong>Spell Power:</strong> {combined.spellPower}</div>
                                <div><strong>Speed:</strong> {combined.speed}</div>
                                <div><strong>Health:</strong> {combined.health}</div>
                                <div><strong>Armor Class:</strong> {combined.armorClass}</div>
                                {combined.classImage && (
    <img 
        src={combined.classImage} 
        alt={getClassNameById(character.classId)} 
        className={`character-class-image ${getClassNameById(character.classId).toLowerCase()}-border`} 
    />
)}

                            </div>
                        );
                    })
                ) : (
                    <p>No characters available</p>
                )}
            </div>
            <button className="start-battle-button" onClick={handleBattleStart}>Start Battle</button>
        </div>
    );
}

export default CharacterSelection;
