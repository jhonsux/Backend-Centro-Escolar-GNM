const express = require('express');
const router = express.Router();
const mysqldump = require('mysqldump');
const pool = require('../db');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, DB_PORT } = require('../config');
require('dotenv').config();

// Ruta para realizar copias de seguridad de la DB
router.get('/', async (req, res) => {
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

// subir datos a tabla alumnos
const upload = multer({ dest: 'uploads/' });
router.post('/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const results = [];

    fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
   // Eliminar el BOM si está presente en la clave 'student_id'
   if (row['﻿student_id']) {
    row.student_id = row['﻿student_id'];
    delete row['﻿student_id'];
  }

  console.log('Student ID:', row.student_id); // Ahora debería mostrarse correctamente sin comillas adicionales


    const query = 'INSERT INTO Alumnos (student_id, name, firstname, lastname, sex, status, group_id, semester_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    pool.query(query, [
      row.student_id,
      row.name,
      row.firstname,
      row.lastname,
      row.sex,
      row.status,
      row.group_id,
      row.semester_id,
      row.parent_id
    ], (error) => {
      if (error) {
        console.error('Error al insertar datos:', error);
      }
    });
  })
  .on('end', () => {
    console.log('CSV procesado exitosamente');
    res.status(201).json({ message: 'Datos agregados correctamente desde CSV' });
  });
});


module.exports = router;
