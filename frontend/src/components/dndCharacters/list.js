// frontend/src/components/dndCharacters/ListRaces.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './list.css'; // Import the CSS file

function ListRaces() {
  const [races, setRaces] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await axios.get('http://localhost:5000/races/getRaces');
        setRaces(response.data);
      } catch (error) {
        setError('Error fetching races.');
      }
    };

    fetchRaces();
  }, []);

  return (
    <div className="list-races-container">
      <h1 className="list-races-title">List of Races</h1>
      {error && <p className="list-races-error">{error}</p>}
      <div className="list-races-grid">
        {races.map((race) => (
          <div
            key={race.id}
            className="list-races-item"
          >
            <h2>{race.name}</h2>
            {/* Display additional details in a fixed format without expanding */}
            <p>Attack Bonus: {race.attackBonus}</p>
            <p>Attack Power: {race.attackPower}</p>
            <p>Spell Attack: {race.spellAttack}</p>
            <p>Spell Power: {race.spellPower}</p>
            <p>Health: {race.health}</p>
            <p>Speed: {race.speed}</p>
            <p>Armor Class: {race.armorClass}</p>
            
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListRaces;
