const mysql = require('mysql2');

//NOTE =====================
//Create a .env file in the root directory and assign DB_HOST, DB_USER, and DB_PASS

const db = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: 'human-resources'
    }
);

module.exports = db;