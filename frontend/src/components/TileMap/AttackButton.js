import React from 'react';

const AttackButton = ({ attacker, defender, handleAttack, isWithinRange, tokenPositions, rollDice }) => {
  const attackerPosition = tokenPositions[attacker.tokenColor];
  const defenderPosition = tokenPositions[defender.tokenColor];

  const handleClick = () => {
    if (isWithinRange(attackerPosition, defenderPosition)) {
      const attackRoll = rollDice();
      const defenderArmorClass = defender.armorClass || 0;
      const isHit = attackRoll >= defenderArmorClass;
      handleAttack(attackRoll, defenderArmorClass, isHit);
    } else {
      alert('Defender is out of range.');
    }
  };

  return (
    <button className="attack-button" onClick={handleClick}>
      Attack
    </button>
  );
};

export default AttackButton;
