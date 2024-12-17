import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CampFight = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data from location state
  const { character, selectedSpells, team1, team2 } = location.state || {};

  // Handle missing data
  if (!character || !selectedSpells || !team1 || !team2) {
    return (
      <div>
        <h1>Error</h1>
        <p>Required data is missing. Please go back and try again.</p>
        <button onClick={() => navigate('/')}>Go to Home</button>
      </div>
    );
  }

  console.log('Received Character:', character);
  console.log('Selected Spells:', selectedSpells);
  console.log('Team 1:', team1);
  console.log('Team 2:', team2);

  return (
    <div>
      <h1>Camp Fight</h1>
      <div>
        <h2>Character Details</h2>
        <p>Name: {character.name}</p>
        <p>Class: {character.className}</p>
        <p>Race: {character.raceName}</p>
        <p>Health: {character.health}</p>
        <p>Armor Class: {character.armorClass}</p>
      </div>

      <div>
        <h2>Selected Spells</h2>
        <ul>
          {selectedSpells.map((spell) => (
            <li key={spell.id}>
              {spell.name} - {spell.damageType}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Teams</h2>
        <div>
          <h3>Team 1</h3>
          <ul>
            {team1.map((member, index) => (
              <li key={index}>{member.npcName || `Unnamed Member ${index + 1}`}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Team 2</h3>
          <ul>
            {team2.map((member, index) => (
              <li key={index}>{member.npcName || `Unnamed Member ${index + 1}`}</li>
            ))}
          </ul>
        </div>
      </div>

      <button onClick={() => navigate('/chapter-one-spell')}>Back to Spell Selection</button>
    </div>
  );
};

export default CampFight;
