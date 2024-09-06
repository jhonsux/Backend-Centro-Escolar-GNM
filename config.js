
// config.js
const DB_HOST = process.env.DB_HOST || 'mysql.railway.internal';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'PAInjSAPICBzQgESmwngCDPiXJWkWKeE';
const DB_NAME = process.env.DB_NAME || 'railway';
const DB_PORT = process.env.DB_PORT || 3306;

module.exports = {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT
};
