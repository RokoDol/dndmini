import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li>
          <Link to="/classes">Classes List</Link>
          <ul className="dropdown">
            <li><Link to="/create-class">Create Class</Link></li>
          </ul>
        </li>
        <li>
          <Link to="/item-list">Item List</Link>
          <ul className="dropdown">
            <li><Link to="/create-item">Create Item</Link></li>
          </ul>
        </li>
        <li>
          <Link to="/races-list">Races List</Link>
          <ul className="dropdown">
            <li><Link to="/create-race">Create Race</Link></li>
          </ul>
        </li>
        <li>
          <Link to="/character-list">Character List</Link>
          <ul className="dropdown">
            <li><Link to="/create-character">Create Character</Link></li>
          </ul>
        </li>
        <li>
          <Link to="/spells-list">Spells List</Link>
          <ul className="dropdown">
            <li><Link to="/create-spell">Create Spell</Link></li>
          </ul>
        </li>
        <li>
          <Link to="/npc-list">NPC List</Link>
          <ul className="dropdown">
            <li><Link to="/npc-form">NPC Form</Link></li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
