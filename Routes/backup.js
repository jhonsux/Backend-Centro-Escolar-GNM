const express = require('express');
const router = express.Router();
const mysqldump = require('mysqldump');
const pool = require('../db');
const fs = require('fs');
const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, DB_PORT } = require('../config');

// Ruta para realizar copias de seguridad de la DB
router.get('/backup', async (req, res) => {
    try {
        const path = 'C:/backups';
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }

        const backupFile = `${path}/backup_${Date.now()}.sql`;

        // Realiza la copia de seguridad con mysqldump
        await mysqldump({
            connection: {
                host: DB_HOST, 
                user: DB_USER,
                password: DB_PASSWORD,
                database: DB_NAME,
                port: DB_PORT
            },
            dumpToFile: backupFile,
        });

        res.download(backupFile); // Envía el archivo para que se descargue en el frontend
    } catch (err) {
        console.error('Error al generar la copia de seguridad:', err);
        res.status(500).send('Error al generar la copia de seguridad');
    }
});



module.exports = router;
