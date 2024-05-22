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

export async function getOneVoice(id) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM voicedata
    WHERE id = ?
    `, [id])
    return rows[0]
}

export async function createVoiceData(userID, totalHours) {
    const [result] = await pool.query(`
    INSERT INTO voicedata (userID, totalHours)
    VALUES (?, ?)
    `, [userID, totalHours])
    return {
        id: result.insertId,
        userID,
        totalHours
    }

}

const voicedata = await getOneVoice(1)
//const voicedata = await createVoiceData('507908285714661388', '397')

console.log("RESULT: ", voicedata)