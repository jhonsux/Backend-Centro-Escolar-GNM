const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = require('./config');
const mysql = require('mysql2/promise');

// Crear un pool de conexiones
const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true, // Espera conexiones si todas están en uso
    connectionLimit: 10,      // Límite máximo de conexiones al mismo tiempo
    queueLimit: 0             // Sin límite en la cola de conexiones
});

// Verificar la conexión inicial
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database as id ' + connection.threadId);
    connection.release(); // Liberar la conexión de vuelta al pool
});

module.exports = pool;


// // db.js
// const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = require('./config');

// const mysql = require('mysql2')
// const conexion = mysql.createConnection({
//     host: DB_HOST,
//     user: DB_USER,
//     password: DB_PASSWORD,
//     database: DB_NAME,
//     port: DB_PORT
// });

// conexion.connect((err) => {
//     if (err) {
//         console.error('Error connecting to the database:', err.stack);
//         return;
//     }
//     console.log('Connected to the database as id ' + conexion.threadId);
// });


// module.exports = conexion;