// frontend/src/components/Battle.js
import React from 'react';

function Battle({ character1, character2 }) {
   

    return (
        <div>
            <h2>Battle Setup</h2>
            <div>
                <h3>Character 1:</h3>
                <p>Name: {character1.name}</p>
                <p>Race: {character1.race}</p>
                <p>Class: {character1.classType}</p>
                <p>Weapon: {character1.weapon}</p>
                
            </div>
            <div>
                <h3>Character 2:</h3>
                <p>Name: {character2.name}</p>
                <p>Race: {character2.race}</p>
                <p>Class: {character2.classType}</p>
                <p>Weapon: {character2.weapon}</p>
                
            </div>
            
        </div>
    );
}

export default Battle;
