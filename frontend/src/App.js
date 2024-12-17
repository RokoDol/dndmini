import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import CreateClass from './components/DndClass/form';
import Classes from './components/DndClass/list';
import CreateRace from './components/dndCharacters/form';
import CreateItem from './components/DndItem/form';
import ItemList from './components/DndItem/list';
import ListRaces from './components/dndCharacters/list';
import CreateCharacter from './components/CreateCharacter/form';
import CharacterList from './components/CreateCharacter/list';
import CreateSpell from './components/Spells/form';
import SpellList from './components/Spells/list';
import Navbar from './components/Navbar';  // Import the Navbar component
import CharacterSelection from './components/CharacterSelection/CharacterSelection.js';
import TileMap from './components/TileMap/TileMap.js';
import { CharacterProvider } from './components/contexts/CharacterContext.js';
import SpellAbilitySelection from './components/CharacterSelection/SpellAbilitySelection.js';
import TwoCharacterSelection from './components/CharacterSelection/TwoCharacterSelection.js';
import TwoSpellAbilitySelection from './components/CharacterSelection/TwoSpellAbilitySelection.js'
import SinglePlayerCharacter from './components/Storymode/singleplayercharacter.js';
import SelectChapter from './components/Storymode/selectChapter.js'
import ChapterOne from './components/Storymode/chapterone.js';
import ChapterOneSpell from './components/Storymode/chapteronespell.js';
import CampFight from './components/Storymode/campFight.js'
import NpcList from './components/Npcs/List.js'
import NpcForm from './components/Npcs/Form.js'


function App() {
  return (
    <Router>
      <CharacterProvider>
        <div>
          <Navbar />  {/* Use the Navbar component */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-class" element={<CreateClass />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/create-item" element={<CreateItem />} />
            <Route path="/item-list" element={<ItemList />} />
            <Route path="/create-race" element={<CreateRace />} />
            <Route path="/races-list" element={<ListRaces />} />
            <Route path="/create-character" element={<CreateCharacter />} />
            <Route path="/character-list" element={<CharacterList />} />
            <Route path="/npc-List" element={<NpcList/>} />
            <Route path="/npc-form" element={<NpcForm />} />
            <Route path="/create-spell" element={<CreateSpell />} />
            <Route path="/spells-list" element={<SpellList />} />
            <Route path="/character-selection" element={<CharacterSelection />} />
            <Route path="/spell-ability-selection" element={<SpellAbilitySelection />} />
            <Route path="/tile-map" element={<TileMap />} />
            <Route path="/twocharacter-selection" element={<TwoCharacterSelection/>}></Route>
            <Route path="/twospellability-selection" element={<TwoSpellAbilitySelection />} />
            <Route path="/singleplayer-character" element={<SinglePlayerCharacter />} />
            <Route path="/select-chapter" element={<SelectChapter/>} />
            <Route path="/Chapter-One" element={<ChapterOne/>} />
            <Route path="/Chapter-One-spell" element={<ChapterOneSpell/>} />
            <Route path="/CampFight" element={<CampFight/>} />
          
          </Routes>
        </div>
      </CharacterProvider>
    </Router>
  );
}

export default App;