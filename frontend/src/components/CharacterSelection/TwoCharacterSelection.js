import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TwoCharacterSelection.css';
import wizardToken from '../tokeni/wizardToken.png'; 
import paladinToken from '../tokeni/paladinToken.png';
import fighterToken from '../tokeni/fighterToken.png';
import { useNavigate } from 'react-router-dom';

function TwoCharacterSelection() {
    const navigate = useNavigate();
    const [characters, setCharacters] = useState([]);
    const [classes, setClasses] = useState([]);
    const [races, setRaces] = useState([]);
    const [error, setError] = useState(null);
    const [team1, setTeam1] = useState([]); // Gold Team
    const [team2, setTeam2] = useState([]); // Green Team
    const [teamSelectionMode, setTeamSelectionMode] = useState('team1'); // Default to team1
    


   
    
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [characterResponse, classResponse, raceResponse] = await Promise.all([
                    axios.get('http://localhost:5000/characters/getCharacters'),
                    axios.get('http://localhost:5000/classes/getClasses'),
                    axios.get('http://localhost:5000/races/getRaces'),
                ]);
                
                setCharacters(characterResponse.data);
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
        
        const className = getClassNameById(character.classId).toLowerCase();
        
        return {
            name: race.name,
            attackBonus: (cls.attackBonus || 0) + (race.attackBonus || 0),
            attackPower: (cls.attackPower || 0) + (race.attackPower || 0),
            spellAttack: (cls.spellAttack || 0) + (race.spellAttack || 0),
            spellPower: (cls.spellPower || 0) + (race.spellPower || 0),
            health: (cls.health || 0) + (race.health || 0),
            armorClass: (cls.armorClass || 0) + (race.armorClass || 0),
            speed: race.speed || 0,
            classImage: classImageMap[className],
        };
    };

    const handleCharacterSelection = (character) => {
        if (team1.includes(character) || team2.includes(character)) {
            return; // Prevent selecting the same character for both teams
        }
    
        const characterWithTeam = { ...character, team: teamSelectionMode === 'team1' ? 'gold' : 'green' };
    
        if (teamSelectionMode === 'team1' && team1.length < 2) {
            setTeam1([...team1, characterWithTeam]);
        } else if (teamSelectionMode === 'team2' && team2.length < 2) {
            setTeam2([...team2, characterWithTeam]);
        }
    
        toggleTeamSelection(); // Switch teams after selection
    };
    
    const toggleTeamSelection = () => {
        setTeamSelectionMode((prevMode) => (prevMode === 'team1' ? 'team2' : 'team1'));
    };

    const isGreyedOut = (character) => {
        return team2.some((c) => c.id === character.id) || team1.some((c) => c.id === character.id);
    };

    return (
        <div className="team-selection-wrapper">
            <h2 className="team-selection-heading">Select Characters for Teams</h2>
            {error && <p className="team-selection-error">{error}</p>}
    
            {/* Team selection indicator */}
            <div className="team-selection-indicator">
                {teamSelectionMode === 'team1' ? 'Choose a character for the Gold Team' : 'Choose a character for the Green Team'}
            </div>
    
            <div className="character-selection-grid">
                {characters.length > 0 ? (
                    characters.map((character) => {
                        const combined = combineAttributes(character);
                        const isSelectedByTeam1 = team1.some((c) => c.id === character.id);
                        const isSelectedByTeam2 = team2.some((c) => c.id === character.id);
                        const greyedOut = isGreyedOut(character);
    
                        return (
                            <div
                                className={`character-selection-item ${isSelectedByTeam1 || isSelectedByTeam2 ? 'character-locked' : ''} ${greyedOut ? 'character-greyed-out' : ''}`}
                                key={character.id}
                                onClick={() => !greyedOut && handleCharacterSelection(character)}
                            >
                                {combined.classImage && (
                                    <img
                                        src={combined.classImage}
                                        alt={getClassNameById(character.classId)}
                                        className="character-class-image"
                                    />
                                )}
                                <h3>{character.name}</h3>
                                <div><strong>Class:</strong> {getClassNameById(character.classId)}</div>
                                <div><strong>Race:</strong> {combined.name}</div>
                                <div><strong>Attack Bonus:</strong> {combined.attackBonus}</div>
                                <div><strong>Attack Power:</strong> {combined.attackPower}</div>
                                <div><strong>Health:</strong> {combined.health}</div>
                            </div>
                        );
                    })
                ) : (
                    <p>No characters available</p>
                )}
            </div>
    
            <div className="team-section">
                <div className="team-box green-team">
                    <h3 style={{ color: '#6fd96f' }}>Green Team</h3>
                    <div className="team-slot">
                        {team2.length > 0 ? (
                            team2.map((character) => (
                                <div key={character.id} className="team-member">
                                    {character.name}
                                </div>
                            ))
                        ) : (
                            <div className="empty-slot">Empty Slot</div>
                        )}
                    </div>
                </div>
                <div className="team-box gold-team">
                    <h3 style={{ color: '#e0b136' }}>Gold Team</h3>
                    <div className="team-slot">
                        {team1.length > 0 ? (
                            team1.map((character) => (
                                <div key={character.id} className="team-member">
                                    {character.name}
                                </div>
                            ))
                        ) : (
                            <div className="empty-slot">Empty Slot</div>
                        )}
                    </div>
                </div>
            </div>
    
            <div className="battle-controls">
            <button
    className="start-battle-btn"
    onClick={() => {
        console.log('Navigating to spell selection');
        navigate('/twospellability-selection', {
            state: { selectedCharacters: [...team1, ...team2], team1, team2 } // Pass teams
        });
    }}
    disabled={team2.length !== 2 || team1.length !== 2}
>
    Choose Your Spells
</button>
            </div>
        </div>
    );
}

export default TwoCharacterSelection;
