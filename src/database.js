import mysql from 'mysql2'

import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}).promise()

// Queries
export async function getVoiceData() {
    const [rows] = await pool.query('SELECT * FROM voicedata')
    return rows
}

// Update the total hours and monthly hours for a user
export async function updateVoiceData(userID, totalHours, monthlyColumn, monthlyHours) {
    await ensureColumnExists(monthlyColumn); // Ensure the monthly column exists
    await pool.query(`
        UPDATE voicedata
        SET totalHours = ?, ?? = ?
        WHERE userID = ?
    `, [parseFloat(totalHours).toFixed(3), monthlyColumn, parseFloat(monthlyHours).toFixed(3), userID]);
}

// Add this function to database.js
export async function getUserTotalHours(userID) {
    const [rows] = await pool.query(`
    SELECT totalHours 
    FROM voicedata
    WHERE userID = ?
    `, [userID]);

    if (rows.length > 0) {
        return rows[0].totalHours;
    } else {
        return null;
    }
}

// Check if column exists and create it if necessary
async function ensureColumnExists(columnName) {
    // Check if the column exists
    const [rows] = await pool.query(`
        SHOW COLUMNS FROM voicedata LIKE ?
    `, [columnName]);

    // If the column doesn't exist, create it
    if (rows.length === 0) {
        await pool.query(`
            ALTER TABLE voicedata
            ADD COLUMN ?? DECIMAL(10, 3) DEFAULT 0
        `, [columnName]);
    }
}


// Add this function to database.js to get user's monthly hours
export async function getUserMonthlyHours(userID, columnName) {
    await ensureColumnExists(columnName); // Ensure the monthly column exists
    const [rows] = await pool.query(`
        SELECT ?? 
        FROM voicedata
        WHERE userID = ?
    `, [columnName, userID]);

    if (rows.length > 0) {
        return rows[0][columnName];
    } else {
        return null;
    }
}

export async function getOneVoice(id) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM voicedata
    WHERE id = ?
    `, [id])
    return rows[0]
}

// Create a new voice data entry for a user
export async function createVoiceData(userID, totalHours, monthlyColumn, monthlyHours) {
    await ensureColumnExists(monthlyColumn); // Ensure the monthly column exists
    const [result] = await pool.query(`
        INSERT INTO voicedata (userID, totalHours, ??)
        VALUES (?, ?, ?)
    `, [monthlyColumn, userID, totalHours, monthlyHours]);
    return {
        id: result.insertId,
        userID,
        totalHours,
        [monthlyColumn]: monthlyHours
    }
}


const voicedata = await getVoiceData()
//const voicedata = await createVoiceData('507908285714661388', '397')

const userIDs = voicedata.map(user => user.userID);