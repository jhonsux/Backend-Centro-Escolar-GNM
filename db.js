

// db.js
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require('./config');

const mysql = require('mysql2')
const conexion = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
});

conexion.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database as id ' + conexion.threadId);
});


module.exports = conexion;