import axios from 'axios';

export const saveNpc = async (npc) => {
  try {
    const response = await axios.post('http://localhost:5000/npcs/saveNpc', npc);
    return response.data;
  } catch (error) {
    console.error('Error saving NPC:', error);
    throw error;
  }
};

export const getNpcs = async () => {
  try {
    const response = await axios.get('http://localhost:5000/npcs/getNpcs');
    return response.data;
  } catch (error) {
    console.error('Error fetching NPCs:', error);
    throw error;
  }
};
