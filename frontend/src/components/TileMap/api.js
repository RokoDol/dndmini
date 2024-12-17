import axios from 'axios';

// Helper function to handle API requests and errors
const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error; // Re-throw to handle in the calling function
  }
};

export const fetchCharacters = async () => {
  return fetchData('http://localhost:5000/characters/getCharacters');
};

export const fetchClasses = async () => {
  return fetchData('http://localhost:5000/classes/getClasses');
};

export const fetchRaces = async () => {
  return fetchData('http://localhost:5000/races/getRaces');
};

export const fetchItems = async () => {
  return fetchData('http://localhost:5000/items/getItems');
};
