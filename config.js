
// config.js
const MYSQLHOST = process.env.MYSQLHOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'jhon';
const DB_NAME = process.env.DB_NAME || 'Centro_escolar';
const DB_PORT = process.env.DB_PORT || 3306;

module.exports = {
    MYSQLHOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT
};

console.log('DB_HOST:', MYSQLHOST);
console.log('DB_USER:', DB_USER);
console.log('DB_PASSWORD:', DB_PASSWORD);
console.log('DB_NAME:', DB_NAME);
console.log('DB_PORT:', DB_PORT);
