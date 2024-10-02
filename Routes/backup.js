const express = require('express');
const router = express.Router();
const mysqldump = require('mysqldump');
const pool = require('../db');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const Importer = require('mysql-import');
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
            dump: {
                addDropTable: true,  // Incluye DROP TABLE antes de cada CREATE TABLE
                // completeInsert: true  // Incluye nombres de columnas en los INSERT
            }
        });

        res.download(backupFile); // Envía el archivo para que se descargue en el frontend
    } catch (err) {
        console.error('Error al generar la copia de seguridad:', err);
        res.status(500).send('Error al generar la copia de seguridad');
    }
});

// Configuración de Multer para cargar archivos en la carpeta 'uploads'
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

// Ruta para restaurar la base de datos desde un archivo SQL
router.post('/restore', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
        }

        const backupFilePath = path.join(uploadDir, req.file.filename);

        // Construir el comando para restaurar la base de datos usando MySQL CLI
        const command = `mysql --host=${DB_HOST} --user=${DB_USER} --password=${DB_PASSWORD} --port=${DB_PORT} ${DB_NAME} < ${backupFilePath}`;

        // Ejecutar el comando
        exec(command, (error, stdout, stderr) => {
            // Manejar errores de ejecución
            if (error) {
                console.error(`Error al ejecutar el comando: ${error.message}`);
                return res.status(500).json({ message: 'Error al restaurar la base de datos', error: error.message });
            }

            if (stderr) {
                console.error(`Error en la restauración: ${stderr}`);
                return res.status(500).json({ message: 'Error en la restauración de la base de datos', error: stderr });
            }

            // Eliminar el archivo después de la importación (opcional)
            fs.unlinkSync(backupFilePath);

            res.status(200).json({ message: 'Base de datos restaurada exitosamente' });
        });
    } catch (err) {
        console.error('Error al restaurar la base de datos:', err);
        res.status(500).json({ message: 'Error al procesar el archivo', error: err.message });
    }
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
