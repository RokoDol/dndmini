import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';  // Import the CSS file
import oneversusone from './tokeni/1v1.png'
import twoversustwo from './tokeni/2v2.png'
import singleplayer from './tokeni/singleplayer.png'

function Home() {
  const navigate = useNavigate();

  

  const openCharacterSelection = () => {
    navigate('/character-selection');
  };

  const openTwoCharacterSelection= () => {
    navigate('/twocharacter-selection')
  }
  const openSinglePlayerCharacter =() => {
    navigate('/singleplayer-character')
  }
  return (
    <div className="home-container">

        <div className="button-group">
        <button
      className="button"
      onClick={openCharacterSelection}
      style={{
        backgroundImage: `url(${oneversusone})`,
        backgroundSize: 'cover', // Makes sure the image covers the button area
        backgroundPosition: 'center', // Centers the image
        width: '200px', // Set width according to your design
        height: '250px', // Set height according to your design
        border: 'none', // Remove border if necessary
        color: 'white', // Text color
        fontSize:'30px',
        cursor: 'pointer', // Change cursor to pointer
      }}
    >
      1 vs 1
    </button>
    <button
      className="button"
      onClick={ openTwoCharacterSelection}
      style={{
        backgroundImage: `url(${twoversustwo})`,
        backgroundSize: 'cover', // Makes sure the image covers the button area
        backgroundPosition: 'center', // Centers the image
        width: '200px', // Set width according to your design
        height: '250px', // Set height according to your design
        border: 'none', // Remove border if necessary
        color: 'white', // Text color
       fontSize:'30px',
        cursor: 'pointer', // Change cursor to pointer
      }}
    >
      2 vs 2
    </button>
    <button
      className="button"
      onClick={ openSinglePlayerCharacter}
      style={{
        backgroundImage: `url(${singleplayer})`,
        backgroundSize: 'cover', // Makes sure the image covers the button area
        backgroundPosition: 'center', // Centers the image
        width: '200px', // Set width according to your design
        height: '250px', // Set height according to your design
        border: 'none', // Remove border if necessary
        color: 'white', // Text color
       fontSize:'30px',
        cursor: 'pointer', // Change cursor to pointer
      }}
    >
     Single Player
    </button>
        </div>
        
      </div>
   
  );
}

export default Home;
