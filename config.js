// config.js
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'jhon1';
const DB_NAME = process.env.DB_NAME || 'centro_escolar';

module.exports = {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
};
