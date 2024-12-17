import React from "react";
import { getClasses } from "./api";
import { useNavigate } from 'react-router-dom';
import './ClassList.css';


const ClassList = () => {
  const [classes, setClasses] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await getClasses();
        console.log("Classes from API:", response); // Check the fetched data
        setClasses(response);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };

    loadClasses();
  }, []);

  return (
    <div className="class-list-container">
      <button className="create-class-button" onClick={() => navigate('/create-class')}>
        Create new Class
      </button>
      {classes.length > 0 ? (
        classes.map((cl) => {
          const className = cl.name.toLowerCase(); // Convert class name to lowercase
          return (
            <div key={cl.id} className={`class-item ${className}`}>
              <div><strong>Name: {cl.name}</strong></div>
              <div>Attack Bonus: {cl.attackBonus}</div>
              <div>Attack Power: {cl.attackPower}</div>
              <div>Spell Attack: {cl.spellAttack}</div>
              <div>Spell Power: {cl.spellPower}</div>
              <div>Health: {cl.health}</div>
              <div>Armor Class: {cl.armorClass}</div>
            </div>
          );
        })
      ) : (
        <div className="no-classes-message">No classes found.</div>
      )}
    </div>
  );
};

export default ClassList;
