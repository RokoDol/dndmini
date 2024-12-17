import axios from 'axios';

export const saveRace = async (race) => {
  try {
    const response = await axios.post('http://localhost:5000/races/saveRace', race);
    return response.data;
  } catch (error) {
    console.error('Greška prilikom spremanja rase:', error);
    throw error;
  }
};

export const getRaces = async () => {
  try {
    const response = await axios.get('http://localhost:5000/races/getRaces');
    return response.data;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja rasa:', error);
    throw error;
  }
};
