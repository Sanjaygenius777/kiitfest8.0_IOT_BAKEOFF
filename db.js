const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

async function getAdminCred() {
  const [rows] = await pool.query("SELECT * FROM admintab");
  return rows;
}

async function insertAdmin(username, pass) {
  const query = "INSERT INTO admintab (username, pass) VALUES (?, ?)";
  const [result] = await pool.query(query, [username, pass]);
  return result.insertId; // Returns the new admin's ID
}

async function getTeamsCred(){
  const [rows]= await pool.query("Select * from Teams");
  return rows;
}
let i = 1; // Question counter

async function insertAnswer(username, answer) {
    const columnName = `Ques${i}`; // Dynamically create column name
    
    if (i === 1) { 
        // First answer → Insert a new row
        const insertQuery = `INSERT INTO decode (Username, ${columnName}) VALUES (?, ?)`;
        await pool.query(insertQuery, [username, answer]);
    } else { 
        // Subsequent answers → Update the existing row
        const updateQuery = `UPDATE decode SET ${columnName} = ? WHERE Username = ?`;
        await pool.query(updateQuery, [answer, username]);
    }
    if(i<10){
      i++; // Move to the next question
    } else{
      i=0;
    }
    
  }

  

  async function updateMTF(username, answers) {
    // Map the JSON keys to the corresponding columns in the MTF table.
    const query = `
      UPDATE MTF SET 
        Ques1A = ?,
        Ques1B = ?,
        Ques1C = ?,
        Ques1D = ?,
        Ques1E = ?,
        Ques2A = ?,
        Ques2B = ?,
        Ques2C = ?,
        Ques2D = ?,
        Ques2E = ?
      WHERE Username = ?
    `;
    const params = [
      answers.resistor,    // Ques1A
      answers.capacitor,   // Ques1B
      answers.inductor,    // Ques1C
      answers.diode,       // Ques1D
      answers.fuse1,       // Ques1E
      answers.transistor,  // Ques2A
      answers.led,         // Ques2B
      answers.transformer, // Ques2C
      answers.fuse2,       // Ques2D
      answers.fuse3,       // Ques2E
      username             // The username for the WHERE clause
    ];
  
    const [result] = await pool.query(query, params);
    return result;
  }


  let trackerCounter = 1;

// Function to update an existing row in the trackers table.
async function updateTrackerAnswer(username, answer) {
  // Dynamically create the column name (e.g., "Ques1", "Ques2", etc.)
  const columnName = `Ques${trackerCounter}`;
  // Always perform an UPDATE query.
  const updateQuery = `UPDATE trackers SET ${columnName} = ? WHERE Username = ?`;
  await pool.query(updateQuery, [answer, username]);

  // Move to the next column; reset if greater than 10.
  if (trackerCounter < 10) {
    trackerCounter++;
  } else {
    trackerCounter = 1; // Optionally, you might want to handle end-of-quiz differently.
  }
}

async function updateDecodeAnswer(username,questionNumber, answer) {
  // Validate questionNumber if necessary (e.g., ensure it is a number between 1 and 10)
  const columnName = `Ques${questionNumber}`;
  const query = `UPDATE decode SET ${columnName} = ? WHERE Username = ?`;
  const [result] = await pool.query(query, [answer, username]);
  return result;
}

async function insertUserIntoTables(username) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert into trackers only if not exists
    await connection.query(
      `INSERT INTO trackers (Username)
       SELECT ? FROM DUAL
       WHERE NOT EXISTS (
         SELECT 1 FROM trackers WHERE Username = ?
       )`,
      [username, username]
    );

    // Insert into MTF only if not exists
    await connection.query(
      `INSERT INTO MTF (Username)
       SELECT ? FROM DUAL
       WHERE NOT EXISTS (
         SELECT 1 FROM MTF WHERE Username = ?
       )`,
      [username, username]
    );

    // Insert into decode only if not exists
    await connection.query(
      `INSERT INTO decode (Username)
       SELECT ? FROM DUAL
       WHERE NOT EXISTS (
         SELECT 1 FROM decode WHERE Username = ?
       )`,
      [username, username]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("❌ Database Insert Error:", error);
  } finally {
    connection.release();
  }
}



module.exports = { getAdminCred,getTeamsCred,insertAnswer,updateMTF,updateTrackerAnswer,updateDecodeAnswer,insertUserIntoTables}; 