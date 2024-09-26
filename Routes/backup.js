const express = require('express');
const router = express.Router();
const mysqldump = require('mysqldump');
const pool = require('../db');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, DB_PORT } = require('../config');
require('dotenv').config();
// Configurar multer para manejar el archivo de respaldo
const upload = multer({ dest: 'uploads/' });


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

// Ruta para restaurar la base de datos
router.post('/restore', upload.single('file'), (req, res) => {
    const backupFilePath = req.file.path;

    // Comando para restaurar la base de datos usando el archivo .sql
    const restoreCommand = `mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < ${backupFilePath}`;

    exec(restoreCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al restaurar la base de datos: ${error}`);
            return res.status(500).send('Error al restaurar la base de datos');
        }
        console.log(`Base de datos restaurada con éxito: ${stdout}`);
        res.status(200).send('Base de datos restaurada correctamente');
    });
});


// subir datos a tabla alumnos
//const upload = multer({ dest: 'uploads/' });
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


// Ruta para subir datos a la tabla Tutores
//const upload = multer({ dest: 'uploads/' });
router.post('/upload-tutores', upload.single('file'), (req, res) => {
    const filePath = req.file.path;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            // Eliminar el BOM si está presente en la clave 'parent_id'
            if (row['﻿parent_id']) {
                row.parent_id = row['﻿parent_id'];
                delete row['﻿parent_id'];
            }

            // Consulta para insertar los datos en la tabla Tutores
            const query = `INSERT INTO Tutores (parent_id, name, firstname, lastname, adress, telephone, email, celphone, description) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            pool.query(query, [
                row.parent_id,
                row.name,
                row.firstname,
                row.lastname,
                row.adress,
                row.telephone,
                row.email,
                row.celphone,
                row.description
            ], (error) => {
                if (error) {
                    console.error('Error al insertar datos en la tabla Tutores:', error);
                }
            });
        })
        .on('end', () => {
            console.log('CSV de tutores procesado exitosamente');
            res.status(201).json({ message: 'Datos de tutores agregados correctamente desde CSV' });
        });
});


module.exports = router;
