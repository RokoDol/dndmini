import axios from 'axios';

// Dohvati sve to-do zadatke
export const saveClass = async (klasa) => {
    // const {name, race,classType,weapon} = character
  try {
    const response = await axios.post('http://localhost:5000/characters/saveClass',klasa);
    return response.data;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja zadataka:', error);
    throw error;
  }
};

// Dodaj novi to-do zadatak
export const getClasses = async () => {
  try {
    const response = await axios.get('http://localhost:5000/characters/getCharacters');
    return response.data;
  } catch (error) {
    console.error('Greška prilikom dodavanja zadatka:', error);
    throw error;
  }
};