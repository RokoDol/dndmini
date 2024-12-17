import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Form.css';

function CreateNpc() {
  const [npcName, setNpcName] = useState('');
  const [npcType, setNpcType] = useState('');
  const [attackBonus, setAttackBonus] = useState('');
  const [attackPower, setAttackPower] = useState('');
  const [spellAttack, setSpellAttack] = useState('');
  const [spellPower, setSpellPower] = useState('');
  const [health, setHealth] = useState('');
  const [armorClass, setArmorClass] = useState('');
  const [speed, setSpeed] = useState('');
  const [level, setLevel] = useState(1);
  const [items, setItems] = useState([]);
  const [spells, setSpells] = useState([]);
  const [selectedWeapon, setSelectedWeapon] = useState('');
  const [selectedSpells, setSelectedSpells] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch items (weapons) and spells on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsResponse = await axios.get('http://localhost:5000/items/getItems');
        const spellsResponse = await axios.get('http://localhost:5000/spells/getSpells');
        
        setItems(itemsResponse.data);
        setSpells(spellsResponse.data);
      } catch (error) {
        console.error('Error fetching items and spells:', error);
      }
    };

    fetchData();
  }, []);

  // Toggle selected spell
  const handleSpellSelection = (spellId) => {
    if (selectedSpells.includes(spellId)) {
      setSelectedSpells(selectedSpells.filter((id) => id !== spellId));
    } else {
      setSelectedSpells([...selectedSpells, spellId]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:5000/npcs/saveNpc', {
        npcName,
        npcType,
        attackBonus,
        attackPower,
        spellAttack,
        spellPower,
        health,
        armorClass,
        speed,
        level,
        weapon: selectedWeapon,
        spells: selectedSpells,
      });
      setSuccess('NPC saved successfully!');
      setError(null);
    } catch (error) {
      console.error('Error saving NPC:', error);
      setError('Error saving NPC.');
      setSuccess(null);
    }
  };

  return (
    <div className="create-npc-container">
      <h1>Create a New NPC</h1>
      <form onSubmit={handleSubmit} className="create-npc-form">
        <div>
          <label>NPC Name:</label>
          <input
            type="text"
            value={npcName}
            onChange={(e) => setNpcName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>NPC Type:</label>
          <input
            type="text"
            value={npcType}
            onChange={(e) => setNpcType(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Attack Bonus:</label>
          <input
            type="number"
            value={attackBonus}
            onChange={(e) => setAttackBonus(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Attack Power:</label>
          <input
            type="number"
            value={attackPower}
            onChange={(e) => setAttackPower(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Spell Attack:</label>
          <input
            type="number"
            value={spellAttack}
            onChange={(e) => setSpellAttack(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Spell Power:</label>
          <input
            type="number"
            value={spellPower}
            onChange={(e) => setSpellPower(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Health:</label>
          <input
            type="number"
            value={health}
            onChange={(e) => setHealth(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Armor Class:</label>
          <input
            type="number"
            value={armorClass}
            onChange={(e) => setArmorClass(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Speed:</label>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Level:</label>
          <input
            type="number"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            min="1"
            required
          />
        </div>
        <div>
          <label>Weapon:</label>
          <select
            value={selectedWeapon}
            onChange={(e) => setSelectedWeapon(e.target.value)}
            required
          >
            <option value="">Select Weapon</option>
            {items
              .filter((item) => item.type === 'weapon')
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label>Spells:</label>
          <div>
            {spells.map((spell) => (
              <button
                type="button"
                key={spell.id}
                onClick={() => handleSpellSelection(spell.id)}
                style={{
                  backgroundColor: selectedSpells.includes(spell.id) ? 'green' : 'gray',
                  color: 'white',
                  margin: '5px',
                  padding: '5px 10px',
                  borderRadius: '5px',
                }}
              >
                {spell.name}
              </button>
            ))}
          </div>
        </div>
        <button type="submit">Save NPC</button>
        <Link to="/npcs-list" className="button-link">
          View All NPCs
        </Link>
      </form>
      {success && <p>{success}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default CreateNpc;
