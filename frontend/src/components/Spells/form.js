import React, { useState, useEffect } from 'react';
import { createSpell } from './api'; // Adjust the path as needed
import { useNavigate } from 'react-router-dom';
import './spellForm.css'; // Ensure the path is correct

const SpellForm = () => {
  const [name, setName] = useState('');
  const [damageType, setDamageType] = useState('');
  const [diceType, setDiceType] = useState('');
  const [description, setDescription] = useState('');
  const [spellRange, setSpellRange] = useState('');
  const [additionalEffects, setAdditionalEffects] = useState([]);
  const [isAoE, setIsAoE] = useState(false);
  const [aoeRadius, setAoeRadius] = useState('');
  const [cooldown, setCooldown] = useState(''); // New state for Cooldown
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const effectsList = ['slow', 'heal', 'movement', 'damage', 'unheal'];

  const handleEffectChange = (e) => {
    const value = e.target.value;
    if (value === '') return;
    if (!additionalEffects.includes(value)) {
      setAdditionalEffects([...additionalEffects, value]);
      if (value === 'movement') {
        setDiceType('');
        setSpellRange('');
      }
    }
    e.target.value = '';
  };

  const removeEffect = (effectToRemove) => {
    setAdditionalEffects(additionalEffects.filter(effect => effect !== effectToRemove));
  };

  useEffect(() => {
    if (damageType === 'heal') {
      setSpellRange('Self');
    } else {
      setSpellRange('');
    }
  }, [damageType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const effects = additionalEffects.join(', ');

      await createSpell({ 
        name, 
        damageType, 
        diceType, 
        description, 
        spellRange, 
        effects,
        isAoE,
        aoeRadius,
        cooldown // Include Cooldown in the payload
      });
      setName('');
      setDamageType('');
      setDiceType('');
      setSpellRange('');
      setDescription('');
      setCooldown(''); // Reset Cooldown state
      setError(null);
      setAdditionalEffects([]);
      setIsAoE(false);
      setAoeRadius('');
      alert('Spell created successfully');
    } catch (error) {
      setError('Failed to create spell');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
        <label>Damage Type:</label>
        <select
          value={damageType}
          onChange={(e) => setDamageType(e.target.value)}
          required
        >
          <option value="">Select Damage Type</option>
          <option value="cold">Cold</option>
          <option value="fire">Fire</option>
          <option value="arcane">Arcane</option>
          <option value="psychic">Psychic</option>
          <option value="acid">Acid</option>
          <option value="force">Force</option>
          <option value="lightning">Lightning</option>
          <option value="necrotic">Necrotic</option>
          <option value="radiant">Radiant</option>
          <option value="thunder">Thunder</option>
          <option value="ability">Ability</option>
          <option value="heal">Heal</option>
        </select>
      </div>

      {/* Conditionally render the Spell Damage field */}
      {!additionalEffects.includes('movement') && (
        <div>
          <label>Spell Damage:</label>
          <input
            type="text"
            value={diceType}
            onChange={(e) => setDiceType(e.target.value)}
            required
            placeholder="e.g., 1d8"
          />
        </div>
      )}

      {/* Conditionally render the Spell Range field */}
      {!additionalEffects.includes('movement') && (
        <div>
          <label>Spell Range:</label>
          <input
            type="text"
            value={spellRange}
            onChange={(e) => setSpellRange(e.target.value)}
            placeholder="30ft"
            required
          />
        </div>
      )}

      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label>Cooldown:</label>
        <textarea
          value={cooldown}
          onChange={(e) => setCooldown(e.target.value)}
          placeholder="e.g., 1, 2..., none"
        />
      </div>

      <div>
        <label>Area of Effect:</label>
        <input
          type="checkbox"
          checked={isAoE}
          onChange={(e) => setIsAoE(e.target.checked)}
        />
      </div>

      {isAoE && (
        <div>
          <label>AoE Radius:</label>
          <input
            type="text"
            value={aoeRadius}
            onChange={(e) => setAoeRadius(e.target.value)}
            placeholder="e.g., 10ft"
          />
        </div>
      )}

      <div>
        <label>Additional Effects:</label>
        <select onChange={handleEffectChange}>
          <option value="">Add Effect</option>
          {effectsList.map((effect) => (
            <option key={effect} value={effect}>
              {effect}
            </option>
          ))}
        </select>
        {additionalEffects.length > 0 && (
          <div>
            <h4>Selected Effects:</h4>
            <ul>
              {additionalEffects.map((effect, index) => (
                <li key={index}>
                  {effect} 
                  <button className="remove-button" type="button" onClick={() => removeEffect(effect)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <button type="submit">Create Spell</button>
      {error && <p className="error">{error}</p>}
      <div className="create-spell-button-container">
        <button
          className="view-spells-button"
          type="button"
          onClick={() => navigate('/spells-list')}
        >
          View All Spells
        </button>
      </div>
    </form>
  );
};

export default SpellForm;