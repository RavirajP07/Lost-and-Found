// Verification Script for CampusConnect DBMS Layer
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server/.env') });

async function verifyDBMS() {
  console.log('Starting CampusConnect DBMS Verification Suite...\n');
  console.log(`Connecting to Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`Database Name: ${process.env.DB_NAME || 'campus_connect'}`);
  console.log(`User: ${process.env.DB_USER || 'root'}\n`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
      database: process.env.DB_NAME || 'campus_connect',
    });
    console.log('✅ Connected to MySQL successfully.\n');
  } catch (err) {
    console.error('❌ Database connection failed. Please make sure MySQL is running and credentials in server/.env are correct.');
    console.error(err.message);
    process.exit(1);
  }

  try {
    // 1. Verify Tables
    const tables = ['Users', 'Admins', 'Categories', 'Items', 'ItemImages', 'Claims', 'Notifications', 'ActivityLogs'];
    console.log('Checking database tables:');
    for (const table of tables) {
      const [rows] = await connection.query(`SHOW TABLES LIKE ?`, [table]);
      if (rows.length > 0) {
        console.log(`  - Table '${table}': ✅ EXISTS`);
      } else {
        console.log(`  - Table '${table}': ❌ NOT FOUND`);
      }
    }
    console.log();

    // 2. Verify Views
    const views = ['vw_item_details', 'vw_claim_details'];
    console.log('Checking database views:');
    for (const view of views) {
      const [rows] = await connection.query(`SHOW FULL TABLES IN ${process.env.DB_NAME || 'campus_connect'} WHERE Table_type = 'VIEW' AND Tables_in_${process.env.DB_NAME || 'campus_connect'} = ?`, [view]);
      if (rows.length > 0) {
        console.log(`  - View '${view}': ✅ EXISTS`);
      } else {
        console.log(`  - View '${view}': ❌ NOT FOUND`);
      }
    }
    console.log();

    // 3. Verify Procedures
    const procedures = ['sp_submit_claim', 'sp_process_claim', 'sp_get_admin_stats'];
    console.log('Checking stored procedures:');
    for (const proc of procedures) {
      const [rows] = await connection.query(`SHOW PROCEDURE STATUS WHERE Db = ? AND Name = ?`, [process.env.DB_NAME || 'campus_connect', proc]);
      if (rows.length > 0) {
        console.log(`  - Procedure '${proc}': ✅ EXISTS`);
      } else {
        console.log(`  - Procedure '${proc}': ❌ NOT FOUND`);
      }
    }
    console.log();

    // 4. Verify Triggers
    const triggers = ['after_claim_insert', 'after_claim_update', 'after_item_insert'];
    console.log('Checking triggers:');
    for (const trig of triggers) {
      const [rows] = await connection.query(`SHOW TRIGGERS LIKE ?`, [trig]);
      // SHOW TRIGGERS does not support direct name filter easily in LIKE without table context, but we check if trigger exists in INFORMATION_SCHEMA
      const [trigRows] = await connection.query(
        `SELECT TRIGGER_NAME FROM INFORMATION_SCHEMA.TRIGGERS WHERE TRIGGER_SCHEMA = ? AND TRIGGER_NAME = ?`,
        [process.env.DB_NAME || 'campus_connect', trig]
      );
      if (trigRows.length > 0) {
        console.log(`  - Trigger '${trig}': ✅ EXISTS`);
      } else {
        console.log(`  - Trigger '${trig}': ❌ NOT FOUND`);
      }
    }
    console.log();

    console.log('DBMS layer verification successfully complete.');
  } catch (err) {
    console.error('❌ Verification check failed with error:');
    console.error(err.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyDBMS();
