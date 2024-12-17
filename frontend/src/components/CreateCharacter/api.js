import axios from 'axios';

// Save a new character
export const saveCharacter = async (character) => {
  try {
    console.log('Saving character:', character);
    const response = await axios.post('http://localhost:5000/characters/saveCharacter', character);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving character:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch all characters
export const getCharacters = async () => {
  try {
    console.log('Fetching characters');
    const response = await axios.get('http://localhost:5000/characters/getCharacters');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching characters:', error.response?.data || error.message);
    throw error;
  }
};
