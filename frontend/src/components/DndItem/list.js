import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './item.css'; // Import the CSS file

const ItemList = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/items/getItems');
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  // Separate items by type
  const weapons = items.filter(item => item.type === 'weapon');
  const armors = items.filter(item => item.type === 'armor');
  const consumables = items.filter(item => item.type === 'consumable');

  return (
    <div className="item-list">
      <h1>Items List</h1>
      <div className="item-grid">
        <div className="item-column">
          <h2>Weapons</h2>
          {weapons.map(item => (
            <div key={item.id} className="item-card">
              <strong>{item.name}</strong>
              <p>Attack Bonus: {item.attackBonus}</p>
              
              <p>Dice Type: {item.diceType}</p> {/* Display dice type */}
              <p>Range: {item.weapRange}</p>
              <p>Frequency: {item.frequency}</p>
              <p>Description: {item.description}</p>
            </div>
          ))}
        </div>
        <div className="item-column">
          <h2>Armors</h2>
          {armors.map(item => (
            <div key={item.id} className="item-card">
              <strong>{item.name}</strong>
              <p>Defense Bonus: {item.defenseBonus}</p>
              <p>Frequency: {item.frequency}</p>
              <p>Description: {item.description}</p>
            </div>
          ))}
        </div>
        <div className="item-column">
          <h2>Consumables</h2>
          {consumables.map(item => (
            <div key={item.id} className="item-card">
              <strong>{item.name}</strong>
              <p>Frequency: {item.frequency}</p>
              <p>Description: {item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default ItemList;
