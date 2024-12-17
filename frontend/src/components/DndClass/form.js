import React, { useState } from 'react';
import { saveClass } from './api';
import { useNavigate } from 'react-router-dom';
import './Create.css'; // Import the fantasy CSS

function ClassCreation() {
  const [name, setName] = useState('');
  const [attackBonus, setAttackBonus] = useState(0);
  const [attackPower, setAttackPower] = useState(0);
  const [spellAttack, setSpellAttack] = useState(0);
  const [spellPower, setSpellPower] = useState(0);
  const [health, setHealth] = useState(0);
  const [armorClass, setArmorClass] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await saveClass({
        name,
        attackBonus,
        attackPower,
        spellAttack,
        spellPower,
        health,
        armorClass,
      });
      navigate('/classes');
      setSuccess('Class saved successfully!');
      setError(null);
    } catch (error) {
      setError('Error saving class. Please try again.');
      setSuccess(null);
    }
  };

  return (
    <div className="class-creation-container">
      <h1>Create a New Character Class</h1>
      <form onSubmit={handleSubmit} className="class-form">
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Attack Bonus:</label>
          <input
            type="number"
            value={attackBonus}
            onChange={(e) => setAttackBonus(parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Attack Power:</label>
          <input
            type="number"
            value={attackPower}
            onChange={(e) => setAttackPower(parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Spell Attack:</label>
          <input
            type="number"
            value={spellAttack}
            onChange={(e) => setSpellAttack(parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Spell Power:</label>
          <input
            type="number"
            value={spellPower}
            onChange={(e) => setSpellPower(parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Health:</label>
          <input
            type="number"
            value={health}
            onChange={(e) => setHealth(parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Armor Class:</label>
          <input
            type="number"
            value={armorClass}
            onChange={(e) => setArmorClass(parseInt(e.target.value))}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Save Class
        </button>
      </form>
      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ClassCreation;
