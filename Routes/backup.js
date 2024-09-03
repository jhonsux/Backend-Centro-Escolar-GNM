const express = require('express');
const router = express.Router();
const mysqldump = require('mysqldump');
const fs = require('fs');

router.get('/backup', async (req, res) => {
    try {
        const path = 'C:/backups';
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }

        const backupFile = `${path}/backup_${Date.now()}.sql`;

        await mysqldump({
            connection: {
                host: 'localhost',
                user: 'root',
                password: 'jhon1',
                database: 'centro_escolar',
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
