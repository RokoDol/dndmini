import React from 'react';
import { useLocation } from 'react-router-dom';
import './Combat.css';  // Import the CSS file

function Combat() {
  const { state } = useLocation();
  const [attacker, setAttacker] = React.useState(null);
  const [target, setTarget] = React.useState(null);

  React.useEffect(() => {
    if (state) {
      const { attacker: initialAttacker, target: initialTarget } = state;
      setAttacker(initialAttacker);
      setTarget(initialTarget);
    }
  }, [state]);

  return (
    <div className="combat-container">
      <h2>Combat</h2>
      <div className="grid">
        {/* Example of how to place characters as tokens on the grid */}
        {attacker && (
          <div
            className="token"
            style={{ left: '100px', top: '100px' }} // Example position
          >
            {attacker.name[0]}
          </div>
        )}
        {target && (
          <div
            className="token"
            style={{ left: '200px', top: '200px' }} // Example position
          >
            {target.name[0]}
          </div>
        )}
      </div>
    </div>
  );
}

export default Combat;
