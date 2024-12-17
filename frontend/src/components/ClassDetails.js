import React, { useState, useEffect, useCallback } from 'react';

function ClassDetails({ race, classType, weapon }) {
    const [health, setHealth] = useState(0);
    const [attackPower, setAttackPower] = useState(0);
    const [armorClass, setArmorClass] = useState(0);
    const [spellPower, setSpellPower] = useState(0);
    const [spellDamage, setSpellDamage] = useState(0);

    const calculateAttributes = useCallback(() => {
        let baseHealth = race === 'Human' ? 17 : race === 'Elf' ? 16 : race === 'Dwarf' ? 19 : 0;
        let classModifier = classType === 'Fighter' ? 2 : classType === 'Wizard' ? -2 : classType === 'Rogue' ? 1 : 0;
        setHealth(baseHealth + classModifier);

        let baseAttackPower = classType === 'Fighter' ? 2 : classType === 'Wizard' ? 0 : classType === 'Rogue' ? 1 : 0;
        let weaponModifier = weapon === 'Sword' ? 2 : weapon === 'Dagger' ? 1 : weapon === 'Staff' ? 0 : 0;
        setAttackPower(baseAttackPower + weaponModifier);

        let baseArmorClass = race === 'Human' ? 11 : race === 'Elf' ? 10 : race === 'Dwarf' ? 12 : 0;
        let armorModifier = classType === 'Fighter' ? 3 : classType === 'Wizard' ? -1 : classType === 'Rogue' ? 2 : 0;
        setArmorClass(baseArmorClass + armorModifier);

        if (weapon === 'Staff') {
            setSpellPower(3);
            setSpellDamage(1);
        } else {
            setSpellPower(0);
            setSpellDamage(0);
        }
    }, [race, classType, weapon]);

    useEffect(() => {
        calculateAttributes();
    }, [calculateAttributes]);

    return (
        <div>
            <h2>Class Details</h2>
            <p>Health: {health}</p>
            <p>Attack Power: {attackPower}</p>
            <p>Armor Class: {armorClass}</p>
            {weapon === 'Staff' && (
                <div>
                    <p>Spell Power: {spellPower}</p>
                    <p>Spell Damage: {spellDamage}</p>
                </div>
            )}
        </div>
    );
}

export default ClassDetails;
