// index.js
const express = require('express');
const cors = require('cors');
const charactersHandler = require('./handlers/characters/index');
const itemsHandler = require('./handlers/items/index');
const classesHandler = require('./handlers/classes/index');
const racesHandler = require('./handlers/races/index');
const createCharacterHandler = require('./handlers/createCharacter/index'); // Import createCharacter handler
const spellsHandler = require('./handlers/spells/index'); // Import spells handler
const npcsHandler = require('./handlers/npcs/index');

const createDatabaseIfNotExists = require('./databaseSetup');
const createTableIfNotExists = require('./initDatabaseTables');

const app = express();
const port = 5000;

// Middleware za parsiranje JSON tijela
app.use(express.json());
app.use(cors());

// Poveži API rute
app.use('/characters', charactersHandler);
app.use('/items', itemsHandler);
app.use('/classes', classesHandler);
app.use('/races', racesHandler);
app.use('/createCharacter', createCharacterHandler);
app.use('/spells', spellsHandler); // Connect the spells route
app.use('/npcs', npcsHandler);

// Kreiraj bazu podataka ako ne postoji
createDatabaseIfNotExists()
  .then(() => {
    // Kreiraj tablice nakon što je baza podataka kreirana
    return createTableIfNotExists();
  })
  .then(() => {
    // Pokreni server nakon što su tablice kreirane
    app.listen(port, () => {
      console.log(`Server je pokrenut na http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Greška prilikom pokretanja servera:', err);
  });