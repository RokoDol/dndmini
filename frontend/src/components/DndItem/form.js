import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateItem.css';

const ItemForm = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('weapon');
  const [attackBonus, setAttackBonus] = useState(0);
  const [defenseBonus, setDefenseBonus] = useState(0);
  const [frequency, setFrequency] = useState('');
  const [description, setDescription] = useState('');
  const [diceType, setDiceType] = useState('');
  const [weapRange, setWeapRange] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      await axios.post('http://localhost:5000/items/saveItem', {
        name,
        type: type.trim(),  // Ensure there are no extra spaces
        attackBonus,
        defenseBonus,
        frequency,
        description,
        diceType,
        weapRange, 
      });
      alert('Item saved successfully!');
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item.');
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="weapon">Weapon</option>
          <option value="armor">Armor</option>
          <option value="consumable">Consumable</option>
        </select>
      </div>

      {/* Fields for Weapons */}
      {type === 'weapon' && (
        <>
          <div>
            <label>Dice Type:</label>
            <input
              type="text"
              value={diceType}
              onChange={(e) => setDiceType(e.target.value)}
              placeholder="e.g., 1d8"
            />
          </div>
          <div>
            <label>Attack Bonus:</label>
            <input
              type="number"
              value={attackBonus}
              onChange={(e) => setAttackBonus(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
      <label>Range:</label>
      <input
        type="text"
        value={weapRange}
        onChange={(e) => setWeapRange(e.target.value)}
        placeholder="e.g., 30 ft."
      />
    </div>
          <div>
            <label>Frequency:</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="">Select Frequency</option>
              <option value="Common">Common</option>
              <option value="Uncommon">Uncommon</option>
              <option value="Rare">Rare</option>
            </select>
          </div>
          <div>
            <label>Description:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </>
      )}

      {/* Fields for Armor */}
      {type === 'armor' && (
        <>
          <div>
            <label>Armor Class:</label>
            <input
              type="number"
              value={defenseBonus}
              onChange={(e) => setDefenseBonus(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label>Frequency:</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="">Select Frequency</option>
              <option value="Common">Common</option>
              <option value="Uncommon">Uncommon</option>
              <option value="Rare">Rare</option>
            </select>
          </div>
          <div>
            <label>Description:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </>
      )}

      {/* Fields for Consumables */}
      {type === 'consumable' && (
        <>
          <div>
            <label>Frequency:</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="">Select Frequency</option>
              <option value="Common">Common</option>
              <option value="Uncommon">Uncommon</option>
              <option value="Rare">Rare</option>
            </select>
          </div>
          <div>
            <label>Description:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </>
      )}

      <button type="submit">Save Item</button>
      <button type="button" onClick={() => navigate('/item-list')}>Show Item List</button>
    </form>
  );
};

export default ItemForm;
