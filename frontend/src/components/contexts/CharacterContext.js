import React, { createContext, useState, useContext } from 'react';

const CharacterContext = createContext();

export const CharacterProvider = ({ children }) => {
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  const selectCharacter = (character) => {
    setSelectedCharacters(prev => {
      if (prev.some(c => c.id === character.id)) {
        return prev.filter(c => c.id !== character.id);
      } else if (prev.length < 2) {
        return [...prev, character];
      }
      return prev;
    });
  };

  return (
    <CharacterContext.Provider value={{ selectedCharacters, selectCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
