import React, { useEffect, useState } from 'react';
import { getNpcs } from './api'; // Adjust the path to your API file

const NpcList = () => {
  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNpcs = async () => {
      try {
        const data = await getNpcs();
        setNpcs(data);
      } catch (err) {
        setError('Failed to fetch NPCs');
      } finally {
        setLoading(false);
      }
    };

    fetchNpcs();
  }, []);

  if (loading) {
    return <p>Loading NPCs...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>NPC List</h2>
      <ul>
        {npcs.map((npc) => (
          <li key={npc.id}>
            <p><strong>Name:</strong> {npc.name}</p>
            <p><strong>Description:</strong> {npc.npcType}</p>
            <p><strong>Level:</strong> {npc.level}</p>
            {/* Add more fields as per your NPC model */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NpcList;
