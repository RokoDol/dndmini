const pool = require('./db'); // Import the connection pool

// SQL query to create the Races table
const createRacesTable = `
  CREATE TABLE IF NOT EXISTS Races (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    attackBonus INT DEFAULT 0,
    attackPower INT DEFAULT 0,
    spellAttack INT DEFAULT 0,
    spellPower INT DEFAULT 0,
    health INT DEFAULT 0,
    armorClass INT DEFAULT 0,
    speed INT DEFAULT 0 -- Added speed column
  );
`;

// SQL to add raceId column to Characters table
const addRaceIdColumnToCharactersTable = `
  ALTER TABLE Characters
  ADD COLUMN raceId INT;
`;

// Function to check and add the raceId column to Characters table
const checkAndAddRaceIdColumn = async (connection) => {
  const checkColumnQuery = `
    SELECT COUNT(*) AS column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Characters' AND COLUMN_NAME = 'raceId';
  `;

  const [rows] = await connection.query(checkColumnQuery);
  if (rows[0].column_exists === 0) {
    await connection.query(addRaceIdColumnToCharactersTable);
    console.log('raceId column added to Characters table.');
  } else {
    console.log('raceId column already exists in Characters table.');
  }
};

// SQL to add missing columns to the Classes table
const addAttackBonusColumnToClassesTable = `
  ALTER TABLE Classes
  ADD COLUMN attackBonus INT DEFAULT 0;
`;

// SQL to add speed column to Races table
const addSpeedColumnToRacesTable = `
  ALTER TABLE Races
  ADD COLUMN speed INT DEFAULT 0;
`;

// Function to check and add a column to the Races table
const checkAndAddColumnToRacesTable = async (connection, columnName, addColumnQuery) => {
  const checkColumnQuery = `
    SELECT COUNT(*) AS column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Races' AND COLUMN_NAME = ?;
  `;

  const [rows] = await connection.query(checkColumnQuery, [columnName]);
  if (rows[0].column_exists === 0) {
    await connection.query(addColumnQuery);
    console.log(`Column ${columnName} added to Races table.`);
  } else {
    console.log(`Column ${columnName} already exists in Races table.`);
  }
};

// SQL to add weapRange column to Items table
const addWeapRangeColumnToItemsTable = `
  ALTER TABLE Items
  ADD COLUMN weapRange VARCHAR(50);
`;

// SQL to rename attackPower column to diceType in Items table
const renameAttackPowerColumnToDiceType = `
  ALTER TABLE Items
  CHANGE COLUMN attackPower diceType VARCHAR(50);
`;

// Function to check and add the weapRange column to Items table
const checkAndAddColumnToItemsTable = async (connection, columnName, addColumnQuery) => {
  const checkColumnQuery = `
    SELECT COUNT(*) AS column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Items' AND COLUMN_NAME = ?;
  `;

  const [rows] = await connection.query(checkColumnQuery, [columnName]);
  if (rows[0].column_exists === 0) {
    await connection.query(addColumnQuery);
    console.log(`Column ${columnName} added to Items table.`);
  } else {
    console.log(`Column ${columnName} already exists in Items table.`);
  }
};

// Function to check and rename the attackPower column to diceType in Items table
const checkAndRenameColumnInItemsTable = async (connection) => {
  const checkColumnQuery = `
    SELECT COUNT(*) AS column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Items' AND COLUMN_NAME = 'attackPower';
  `;

  const [rows] = await connection.query(checkColumnQuery);
  if (rows[0].column_exists > 0) {
    await connection.query(renameAttackPowerColumnToDiceType);
    console.log('Column attackPower renamed to diceType in Items table.');
  } else {
    console.log('Column attackPower does not exist in Items table.');
  }
};

// SQL query to rename the range column to spellRange in Spells table
const renameRangeColumnToSpellRange = `
  ALTER TABLE Spells
  CHANGE COLUMN \`range\` spellRange VARCHAR(50);
`;

// Function to check and rename the range column to spellRange in Spells table
const checkAndRenameColumnInSpellsTable = async (connection) => {
  const checkColumnQuery = `
    SELECT COUNT(*) AS column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Spells' AND COLUMN_NAME = 'range';
  `;

  const [rows] = await connection.query(checkColumnQuery);
  if (rows[0].column_exists > 0) {
    await connection.query(renameRangeColumnToSpellRange);
    console.log('Column range renamed to spellRange in Spells table.');
  } else {
    console.log('Column range does not exist in Spells table.');
  }
};

// SQL queries to create the tables
const createClassTable = `
  CREATE TABLE IF NOT EXISTS Classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    attackBonus INT DEFAULT 0,
    attackPower INT DEFAULT 0,
    spellAttack INT DEFAULT 0,
    spellPower INT DEFAULT 0,
    health INT DEFAULT 0,
    armorClass INT DEFAULT 0
  );
`;
const createNpcTable = `
  CREATE TABLE IF NOT EXISTS NPCs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    npcName VARCHAR(255) NOT NULL,
    npcType VARCHAR(255) NOT NULL,
    attackBonus INT NOT NULL,
    attackPower INT NOT NULL,
    spellAttack INT NOT NULL,
    spellPower INT NOT NULL,
    health INT NOT NULL,
    armorClass INT NOT NULL,
    speed INT NOT NULL,
    level INT NOT NULL DEFAULT 1,
    weaponId INT, -- Assuming this references the ID of a weapon in another table
    spellIds JSON, -- To store an array of spell IDs as JSON
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (weaponId) REFERENCES Items(id) ON DELETE SET NULL
  );
`;


const renameNpcNameColumn = async (connection) => {
  const checkColumnQuery = `
    SELECT COUNT(*) AS column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'NPCs' AND COLUMN_NAME = 'npcName';
  `;

  const [rows] = await connection.query(checkColumnQuery);
  if (rows[0].column_exists === 1) {
    const renameColumnQuery = `
      ALTER TABLE NPCs
      CHANGE COLUMN npcName name VARCHAR(255) NOT NULL;
    `;
    await connection.query(renameColumnQuery);
    console.log('npcName column renamed to name in NPCs table.');
  } else {
    console.log('npcName column does not exist in NPCs table.');
  }
};


const createItemTable = `
  CREATE TABLE IF NOT EXISTS Items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type ENUM('weapon', 'shield', 'armor', 'consumable') NOT NULL,
    attackBonus INT DEFAULT 0,
    defenseBonus INT DEFAULT 0,
    diceType VARCHAR(50), -- Renamed attackPower to diceType
    weapRange VARCHAR(50), -- New weapRange column
    frequency ENUM('Common', 'Uncommon', 'Rare') DEFAULT 'Common',
    description VARCHAR(255)
  );
`;

const createCharacterTable = `
  CREATE TABLE IF NOT EXISTS Characters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    classId INT NOT NULL,
    raceId INT,
    weaponId INT,
    shieldId INT,
    level INT NOT NULL DEFAULT 1, -- Level with a default value of 1
    isNpc BOOLEAN NOT NULL DEFAULT false, -- New column for NPC flag
    spellIds JSON DEFAULT NULL, -- New column for storing spell IDs in JSON format
    FOREIGN KEY (classId) REFERENCES Classes(id),
    FOREIGN KEY (raceId) REFERENCES Races(id),
    FOREIGN KEY (weaponId) REFERENCES Items(id),
    FOREIGN KEY (shieldId) REFERENCES Items(id)
  );
`;

// Add isNpc and spellIds columns to Characters table
const addNewColumnsToCharactersTable = async (connection) => {
  const columns = [
    { name: 'isNpc', definition: 'BOOLEAN NOT NULL DEFAULT false' },
    { name: 'spellIds', definition: 'JSON DEFAULT NULL' },
  ];

  for (const { name, definition } of columns) {
    const checkColumnQuery = `
      SELECT COUNT(*) AS column_exists
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Characters' AND COLUMN_NAME = '${name}';
    `;
    const [rows] = await connection.query(checkColumnQuery);
    if (rows[0].column_exists === 0) {
      await connection.query(`ALTER TABLE Characters ADD COLUMN ${name} ${definition};`);
      console.log(`${name} column added to Characters table.`);
    } else {
      console.log(`${name} column already exists in Characters table.`);
    }
  }
};

const alterCharacterTable = `
  ALTER TABLE Characters
  ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1;
`;
const createSpellsTable = `
  CREATE TABLE IF NOT EXISTS Spells (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    damageType ENUM('cold', 'fire', 'arcane', 'psychic', 'acid', 'force', 'lightning', 'necrotic', 'radiant', 'thunder', 'ability', 'heal') NOT NULL,
    spellRange VARCHAR(50), -- Range column
    diceType VARCHAR(50), -- Renamed spellDamage to diceType
    description VARCHAR(255),
    isAoE TINYINT(1) DEFAULT 0, -- AoE flag, 1 for true, 0 for false
    aoeRadius VARCHAR(50) DEFAULT NULL, -- AoE radius, e.g., 10ft, with default value of NULL
    cooldown VARCHAR(50) DEFAULT NULL, -- Add Cooldown column
    classId INT,  -- Add classId column here
    FOREIGN KEY (classId) REFERENCES Classes(id)  -- Foreign key constraint
  );
`;

// SQL query to create the SpellClasses table
const createSpellClassesTable = `
  CREATE TABLE IF NOT EXISTS SpellClasses (
    spellId INT,
    classId INT,
    FOREIGN KEY (spellId) REFERENCES Spells(id),
    FOREIGN KEY (classId) REFERENCES Classes(id),
    PRIMARY KEY (spellId, classId)
  );
`;

// Function to check and add the classId column to Spells table
const addClassIdColumnToSpellsTable = `
  ALTER TABLE Spells
  ADD COLUMN classId INT;
`;

const addHealDamageType = async (connection) => {
  await connection.query(`
    ALTER TABLE Spells
    MODIFY COLUMN damageType ENUM('cold', 'fire', 'arcane', 'psychic', 'acid', 'force', 'lightning', 'necrotic', 'radiant', 'thunder', 'ability', 'heal') NOT NULL;
  `);
};

const addCooldownColumn = async (connection) => {
  const checkColumnQuery = `
    SELECT COUNT(*) AS column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Spells' AND COLUMN_NAME = 'cooldown';
  `;

  const [rows] = await connection.query(checkColumnQuery);
  const columnExists = rows[0].column_exists;

  if (columnExists === 0) {
    const addColumnQuery = `
      ALTER TABLE Spells
      ADD COLUMN cooldown VARCHAR(50) DEFAULT NULL;
    `;

    await connection.query(addColumnQuery);
    console.log('Cooldown column added to Spells table.');
  } else {
    console.log('Cooldown column already exists in Spells table.');
  }
};

// Add level column to Characters table
const addLevelColumnToCharactersTable = async (connection) => {
  const checkColumnQuery = `
    SELECT COUNT(*) AS column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Characters' AND COLUMN_NAME = 'level';
  `;

  const [rows] = await connection.query(checkColumnQuery);
  if (rows[0].column_exists === 0) {
    await connection.query(`
      ALTER TABLE Characters ADD COLUMN level INT NOT NULL DEFAULT 1;
    `);
    console.log('Level column added to Characters table.');
  } else {
    console.log('Level column already exists in Characters table.');
  }
};
const addEffectsColumn = async (connection) => {
  const checkColumnQuery = `
    SELECT COUNT(*) AS column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Spells' AND COLUMN_NAME = 'effects';
  `;

  const [rows] = await connection.query(checkColumnQuery);
  if (rows[0].column_exists === 0) {
    await connection.query(`
      ALTER TABLE Spells
      ADD COLUMN effects VARCHAR(255);
    `);
    console.log('effects column added to Spells table.');
  } else {
    console.log('effects column already exists in Spells table.');
  }
};

const checkAndAddClassIdColumnToSpellsTable = async (connection) => {
  const checkColumnQuery = `
    SELECT COUNT(*) AS column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Spells' AND COLUMN_NAME = 'classId';
  `;

  const [rows] = await connection.query(checkColumnQuery);
  if (rows[0].column_exists === 0) {
    await connection.query(addClassIdColumnToSpellsTable);
    console.log('classId column added to Spells table.');
  } else {
    console.log('classId column already exists in Spells table.');
  }
};

// initDatabaseTables.js
const createTables = async () => {
  try {
    const connection = await pool.getConnection();

    // Execute table creation queries
    await connection.query(createClassTable);
    await connection.query(createItemTable);
    await connection.query(createCharacterTable);
    await connection.query(createRacesTable);
    await connection.query(createSpellsTable);
    await connection.query(createSpellClassesTable);
    await connection.query(createNpcTable); // Create NPCs table

    await addHealDamageType(connection);

    // Check and add or update columns as needed
    await checkAndAddColumnToRacesTable(connection, 'speed', addSpeedColumnToRacesTable);
    await checkAndAddRaceIdColumn(connection);
    await checkAndAddColumnToItemsTable(connection, 'weapRange', addWeapRangeColumnToItemsTable);
    await checkAndRenameColumnInItemsTable(connection);
    await checkAndRenameColumnInSpellsTable(connection);
    await addEffectsColumn(connection);
    await addCooldownColumn(connection);
    await addNewColumnsToCharactersTable(connection); // Add new columns to Characters table

    // Add or modify specific columns
    await addLevelColumnToCharactersTable(connection);

    // Rename npcName to name in NPCs table
    await renameNpcNameColumn(connection);

    console.log('Tables created and columns updated successfully.');
    connection.release();
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

module.exports = createTables; // Ensure this is exported correctly