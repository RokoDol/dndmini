import axios from 'axios';

const API_URL = 'http://localhost:5000/spells';

// Function to create a spell
export const createSpell = async (spellData) => {
  try {
    const response = await axios.post(API_URL, spellData);
    return response.data;
  } catch (error) {
    console.error('Error creating spell:', error);
    throw error;
  }
};

// Function to fetch all spells
export const fetchSpells = async () => {
  try {
    const response = await axios.get(`${API_URL}/getSpells`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch spells');
  }
};
