const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const mysqlImport = require('mysql-import');
const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, DB_PORT } = require('../config');
require('dotenv').config();

// Ruta para realizar copias de seguridad de la DB
app.get('/', (req, res) => {
    // Nombre del archivo de la copia de seguridad con timestamp
    const backupFile = path.join(__dirname, `backup_${DB_NAME}_${Date.now()}.sql`);

    const importer = mysqlImport.config({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT
    });

    importer.export(backupFile)
        .then(() => {
            // Enviar el archivo como respuesta para que el frontend lo descargue
            res.download(backupFile, (err) => {
                if (err) {
                    console.error('Error enviando el archivo:', err);
                    res.status(500).send('Error enviando el archivo');
                } else {
                    // Elimina el archivo temporal después de que se haya descargado
                    fs.unlinkSync(backupFile);
                }
            });
        })
        .catch((err) => {
            console.error('Error realizando el backup:', err);
            res.status(500).send('Error realizando el backup');
        });
});

// Configuración de Multer para cargar archivos en la carpeta 'uploads'
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: 'uploads/' });

// Ruta para restaurar la base de datos desde un archivo SQL subido
app.post('/restore', upload.single('backup'), (req, res) => {
    const backupFile = req.file.path; // Ruta temporal del archivo subido

    const importer = mysqlImport.config({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT
    });

    importer.import(backupFile)
        .then(() => {
            // Eliminar el archivo después de la restauración
            fs.unlinkSync(backupFile);

            res.status(200).send('Base de datos restaurada exitosamente.');
        })
        .catch((err) => {
            console.error('Error restaurando la base de datos:', err);
            res.status(500).send('Error restaurando la base de datos');
        });
});

// subir datos a tabla alumnos
//const upload = multer({ dest: 'uploads/' });
router.post('/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const results = [];

    // Verifica si se ha subido el archivo
    if (!req.file) {
        return res.status(400).json({ message: 'Error al restaurar la base de datos', error });
    }

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

    // Verifica si se ha subido el archivo
    if (!req.file) {
        return res.status(400).json({ message: 'Error al restaurar la base de datos', error });
    }

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
