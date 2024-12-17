const mysql = require('mysql2/promise');

async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password'
  });

  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS DND');
    console.log('Baza podataka "DND" je kreirana ili već postoji.');
  } catch (err) {
    console.error('Greška prilikom kreiranja baze podataka:', err);
  } finally {
    await connection.end();
  }
}

module.exports = createDatabaseIfNotExists;