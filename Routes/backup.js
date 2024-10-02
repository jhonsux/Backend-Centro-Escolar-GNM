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
router.post('/', async (req, res) => {
    try {
        const backupFilePath = path.join(__dirname, 'backups', `backup-${Date.now()}.sql`);

        // Crea la carpeta si no existe
        if (!fs.existsSync(path.join(__dirname, 'backups'))) {
            fs.mkdirSync(path.join(__dirname, 'backups'), { recursive: true });
        }

        // Ejecutar mysqldump
        exec(`mysqldump -u${DB_USER} -p${DB_PASSWORD} -h${DB_HOST} --port=${DB_PORT} ${DB_NAME} > ${backupFilePath}`, (err, stdout, stderr) => {
            if (err) {
                console.error('Error al crear el backup:', err);
                return res.status(500).json({ message: 'Error al crear el backup', error: err.message });
            }

            console.log('Backup creado exitosamente:', stdout);
            res.status(200).json({ message: 'Backup creado exitosamente', filePath: backupFilePath });
        });
    } catch (error) {
        console.error('Error al crear el backup:', error);
        res.status(500).json({ message: 'Error al crear el backup', error: error.message });
    }
});


// Configuración de Multer para cargar archivos en la carpeta 'uploads'
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

// Función para limpiar el archivo SQL de comentarios y comandos no válidos
function limpiarSQL(data) {
    return data
        .split('\n')
        .filter(line => {
            return !(line.startsWith('--') || line.startsWith('/*') || line.startsWith('*/') || line.startsWith('/*!'));
        })
        .join('\n');
}

// Función para ejecutar el archivo SQL
function ejecutarSQLDesdeArchivo(filePath, connection) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }

            // Limpiar el contenido SQL para evitar errores
            const sqlLimpio = limpiarSQL(data);

            // Ejecutar el archivo SQL limpio en la base de datos
            connection.query(sqlLimpio, (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    });
}

// Ruta para restaurar la base de datos desde un archivo SQL
router.post('/restore', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
        }

        const backupFilePath = path.join(uploadDir, req.file.filename);

        // Obtener conexión del pool
        pool.getConnection(async (err, connection) => {
            if (err) {
                console.error('Error al obtener la conexión:', err);
                return res.status(500).json({ message: 'Error al conectar con la base de datos' });
            }

            try {
                // Ejecutar el archivo SQL
                await ejecutarSQLDesdeArchivo(backupFilePath, connection);
                fs.unlinkSync(backupFilePath); // Eliminar el archivo después de la importación
                res.status(200).json({ message: 'Base de datos restaurada exitosamente' });
            } catch (error) {
                console.error('Error al ejecutar el archivo SQL:', error);
                res.status(500).json({ message: 'Error al restaurar la base de datos', error: error.message });
            } finally {
                connection.release(); // Liberar la conexión de vuelta al pool
            }
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
