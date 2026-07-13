const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server/.env') });

async function setup() {
  console.log('Running CampusConnect Database Setup Script...\n');

  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
  const database = process.env.DB_NAME || 'campus_connect';

  console.log(`Connecting to Host: ${host}`);
  console.log(`User: ${user}`);
  console.log(`Database Target: ${database}\n`);

  let connection;
  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host,
      user,
      password,
      multipleStatements: true
    });
  } catch (err) {
    console.error('❌ Connection failed! Please check your credentials in server/.env.');
    console.error(`Error details: ${err.message}`);
    process.exit(1);
  }

  try {
    console.log('Creating database if not exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${database};`);
    await connection.query(`USE ${database};`);
    console.log('✅ Database selected.\n');

    // 1. Load schema
    console.log('Loading schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'database/schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Schema tables and views created.\n');

    // 2. Load triggers
    console.log('Loading triggers.sql...');
    let triggersSql = fs.readFileSync(path.join(__dirname, 'database/triggers.sql'), 'utf8');
    // Strip CLI-specific DELIMITER commands so it runs correctly in mysql2
    triggersSql = triggersSql.replace(/DELIMITER\s+\/\/|DELIMITER\s+;/gi, '');
    triggersSql = triggersSql.replace(/\/\/$/gm, ';');
    await connection.query(triggersSql);
    console.log('✅ Triggers registered.\n');

    // 3. Load procedures
    console.log('Loading procedures.sql...');
    let proceduresSql = fs.readFileSync(path.join(__dirname, 'database/procedures.sql'), 'utf8');
    proceduresSql = proceduresSql.replace(/DELIMITER\s+\/\/|DELIMITER\s+;/gi, '');
    proceduresSql = proceduresSql.replace(/\/\/$/gm, ';');
    await connection.query(proceduresSql);
    console.log('✅ Stored procedures registered.\n');

    // 4. Load sample data
    console.log('Loading sample_data.sql...');
    const sampleDataSql = fs.readFileSync(path.join(__dirname, 'database/sample_data.sql'), 'utf8');
    await connection.query(sampleDataSql);
    console.log('✅ Sample data seeded successfully.\n');

    console.log('🎉 Database setup complete!');
  } catch (err) {
    console.error('❌ Error executing SQL script:');
    console.error(err.message);
  } finally {
    if (connection) await connection.end();
  }
}

setup();
