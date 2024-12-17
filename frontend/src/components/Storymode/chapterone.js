import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import "./chapterOne.css";
import firstshot from "../tokeni/firstshot.png";
import townshot from "../tokeni/townshot.png";  
import forestshot from '../tokeni/forest.png';
import campshot from '../tokeni/campsite.png';
import { useEffect } from "react";
const ChapterOne = () => {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChapterTitle, setShowChapterTitle] = useState(true);
  const [showFirstShot, setShowFirstShot] = useState(false);
  const [showTownShot, setShowTownShot] = useState(false);
  const [showForestShot, setShowForestShot] = useState(false);
  const [showCampShot, setShowCampShot] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [buttonText, setButtonText] = useState("Continue");

  const navigate = useNavigate();
  
  const location = useLocation();  // Get the current location
  const { chapter } = location.state || {};  // Retrieve the chapter from the state
  const { winner } = location.state || {}; // Retrieve the winner state


  useEffect(() => {
    if (winner === "gold") {
      setDialogueIndex(15); // Start from specific dialogue after the battle
      console.log("Gold team won. Returning to post-battle dialogue.");
    }
  }, [winner]);
  const dialogue = [
    "You are resting in the warm glow of the tavern, a mug of ale in hand. The chatter around you is mundane, ordinary, just another night like the last...",
    "The fire crackles in the hearth, the soft hum of the conversation blending with the occasional clink of mugs and plates.",
    "Suddenly, the doors burst open, slamming against the walls. A man, disheveled and clearly distressed, rushes in, eyes wild with fear.",
    "'They... they took him! My boy! Those creatures... green, horrible things... they took him!' His voice cracks as he approaches you, panic evident in his every step.",
    "'Please! You must help me! They took him deep into the forest... I can't do it alone!' The man begs, his hands trembling as he grasps at your arm.",
    "Before you can respond, a halfling standing by the tavern’s entrance steps forward. He tilts his head, a grin tugging at his lips despite the grim situation.",
    "'I’ll help,' he says, his voice calm and steady. 'I know the forest well. You’re going to need me if you want to save that boy.'",
    "The man looks between you and the halfling, his expression a mix of relief and desperation. The adventure, it seems, has already begun.",
    "After gathering your belongings, you, Gorn, and the father make your way toward the 'crime scene'—a small clearing just outside the town where the boy was last seen.",
    "You search the area, looking for any clues that could lead you to the boy's whereabouts. After a few moments, you spot something odd on the ground.",
    "Small footprints, too tiny to belong to an adult, but large enough to be from a child, lead off to the north, toward the forest's edge.",
    "'This way,' Gorn says quietly, his eyes narrowing. 'Let's go.'",
    "Arriving at the forest edge, you find footprints leading deeper in.",
    "Following the tracks leads you and Gorn to the forest. As you travel and get to know each other, you reach a small clearing.",
    "The tracks lead you on for 15 minutes before you come to a small clearing in the woods.",
    "Before you, you see few tents and you hear weird noises and language that you don't understand.",
    "'We've found them', says Gorn 'Prepare yourself', he adds.",
    "Only a few moments pass before you notice that the small green creatures noticed you two and they are ready to fight."
  ];

  const handlePlayButtonClick = async () => {
    if (containerRef.current && !document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);

        setShowChapterTitle(true);
        setTimeout(() => {
          setShowChapterTitle(false);
          setShowFirstShot(true);
        }, 3000);

        setTimeout(() => {
          setIsTextVisible(true);
        }, 5000);
      } catch (error) {
        console.error("Error entering fullscreen:", error);
      }
    }
  };

  const showNextDialogue = () => {
    if (dialogueIndex < dialogue.length) {
      const currentLine = dialogue[dialogueIndex];
  
      if (currentLine === "The man looks between you and the halfling, his expression a mix of relief and desperation. The adventure, it seems, has already begun.") {
        setShowFirstShot(false);
        setShowTownShot(true); 
      }
  
      if (currentLine === "Arriving at the forest edge, you find footprints leading deeper in.") {
        setShowTownShot(false);
        setShowForestShot(true);
      }
  
      if (currentLine === "Before you, you see few tents and you hear weird noises and language that you don't understand.") {
        setShowForestShot(false);
        setShowCampShot(true);
      }
  
      setDialogueIndex(dialogueIndex + 1);
  
      if (dialogueIndex === 1) {
        setIsTextVisible(true);
      }

      if (dialogueIndex === dialogue.length - 1) {
        setButtonText("Prepare for Battle");
      }
    } 
  };

  const handleButtonClick = () => {
    if (buttonText === "Prepare for Battle") {
      navigate("/Chapter-One-spell", { state: { fromChapterOne: true } }); // Add this flag
    } else {
      showNextDialogue();
    }
  };

  return (
    <div ref={containerRef} className="chapter-one-container">
      {!isFullscreen && (
        <div className="chapter-text">
          <h1>{chapter === 'chapterOne' ? 'Chapter One: Introduction' : 'Another Chapter'}</h1>
          <p>{chapter === 'chapterOne' ? "This is the content of Chapter One. Enjoy your adventure!" : "You have entered another chapter of your journey."}</p>
          <button className="play-button" onClick={handlePlayButtonClick}>
            Start Adventure
          </button>
        </div>
      )}

      {isFullscreen && (
        <div className="chapter-content">
          {showChapterTitle && (
            <div className="chapter-title fade-in">
              <h1>CHAPTER I</h1>
            </div>
          )}

          {showFirstShot && (
            <div className="firstshot-container fade-in">
              <img src={firstshot} alt="First Shot" className="firstshot-image" />
            </div>
          )}

          {showTownShot && (
            <div className="townshot-container fade-in">
              <img src={townshot} alt="Town Shot" className="townshot-image" />
            </div>
          )}

          {showForestShot && (
            <div className="forestshot-container fade-in">
              <img src={forestshot} alt="Forest Shot" className="forestshot-image" />
            </div>
          )}

          {showCampShot && (
            <div className="campshot-container fade-in">
              <img src={campshot} alt="Camp Shot" className="campshot-image" />
            </div>
          )}

          {isTextVisible && (
            <div className="text-dialogue-container fade-in">
              <p className="text-dialogue">{dialogue[dialogueIndex]}</p>
              <button onClick={handleButtonClick} className="next-button">
                {buttonText}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChapterOne;
