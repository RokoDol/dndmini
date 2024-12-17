import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './createRace.css';

function CreateRace() {
  const [raceName, setRaceName] = useState('');
  const [attackBonus, setAttackBonus] = useState('');
  const [attackPower, setAttackPower] = useState('');
  const [spellAttack, setSpellAttack] = useState('');
  const [spellPower, setSpellPower] = useState('');
  const [health, setHealth] = useState('');
  const [speed, setSpeed] = useState(''); // New state for Speed
  const [armorClass, setArmorClass] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:5000/races/saveRace', {
        raceName,
        attackBonus,
        attackPower,
        spellAttack,
        spellPower,
        health,
        armorClass,
        speed,
      });
      setSuccess('Race saved successfully!');
      setError(null);
    } catch (error) {
      setError('Error saving race.');
      setSuccess(null);
    }
  };

  return (
    <div className="create-race-container">
      <h1>Create a New Race</h1>
      <form onSubmit={handleSubmit} className="create-race-form">
        <div>
          <label>Race Name:</label>
          <input
            type="text"
            value={raceName}
            onChange={(e) => setRaceName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Speed:</label>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Attack Bonus:</label>
          <input
            type="number"
            value={attackBonus}
            onChange={(e) => setAttackBonus(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Attack Power:</label>
          <input
            type="number"
            value={attackPower}
            onChange={(e) => setAttackPower(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Spell Attack:</label>
          <input
            type="number"
            value={spellAttack}
            onChange={(e) => setSpellAttack(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Spell Power:</label>
          <input
            type="number"
            value={spellPower}
            onChange={(e) => setSpellPower(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Health:</label>
          <input
            type="number"
            value={health}
            onChange={(e) => setHealth(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Armor Class:</label>
          <input
            type="number"
            value={armorClass}
            onChange={(e) => setArmorClass(e.target.value)}
            required
          />
        </div>
        <button type="submit">Save Race</button>
        <Link to="/races-list" className="button-link">View All Races</Link>
      </form>
      {success && <p>{success}</p>}
      {error && <p>{error}</p>}
      
    </div>
  );
}

export default CreateRace;
