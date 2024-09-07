const express = require('express');
const router = express.Router('');
const verifyToken = require('../middlewares/verifyToken');
const connection = require('../db');
const pool = require('../db');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
require('dotenv').config();

// Ruta para obtener todos los Ciclos
router.get('/', verifyToken, (req, res) => {
    const query = `SELECT * FROM ciclos_escolares`;

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json(results);
    });
});


// Ruta para Crear un nuevo Ciclo
router.post('/crear', verifyToken, (req, res) => {
    const { fecha_inicio, fecha_fin } = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error al obtener la conexión del pool:', err);
            return res.status(500).send('Error al obtener la conexión');
        }

        connection.beginTransaction(error => {
            if (error) {
                console.error('Error al iniciar la transacción:', error);
                connection.release(); // Liberar la conexión
                return res.status(500).send('Error al iniciar la transacción');
            }

            // Paso 1: Insertar el nuevo ciclo escolar
            const queryCiclo = `INSERT INTO ciclos_escolares (fecha_inicio, fecha_fin) VALUES (?, ?)`;
            connection.query(queryCiclo, [fecha_inicio, fecha_fin], (error, results) => {
                if (error) {
                    console.error('Error al insertar ciclo escolar:', error);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send('Error al insertar ciclo escolar');
                    });
                }

                // Paso 2: Mover alumnos del sexto semestre a la tabla de graduados
                const queryMoverAlumnos = `INSERT INTO alumnos_graduados (student_id, name, firstname, lastname, sex, status, group_id, semester_id, parent_id)
                    SELECT student_id, name, firstname, lastname, sex, status, group_id, semester_id, parent_id
                    FROM alumnos
                    WHERE semester_id = 7`;
                connection.query(queryMoverAlumnos, (error, results) => {
                    if (error) {
                        console.error('Error al mover alumnos:', error);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send('Error al mover alumnos');
                        });
                    }

                    // Paso 3: Eliminar alumnos del sexto semestre de la tabla original
                    const queryEliminarAlumnos = `DELETE FROM alumnos WHERE semester_id = 7`;
                    connection.query(queryEliminarAlumnos, (error, results) => {
                        if (error) {
                            console.error('Error al eliminar alumnos:', error);
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).send('Error al eliminar alumnos');
                            });
                        }
                    });

                    // Commit de la transacción
                    connection.commit(error => {
                        if (error) {
                            console.error('Error al hacer commit:', error);
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).send('Error al hacer commit');
                            });
                        }

                        connection.release(); // Liberar la conexión
                        res.status(201).json({
                            message: 'Ciclo escolar creado, semestres actualizados, y alumnos graduados movidos correctamente'
                        });
                    });
                });
            });
        });
    });
});


// Ruta para subir datos a la tabla Alumnos
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            // Eliminar el BOM si está presente en la clave 'student_id'
            if (row['﻿student_id']) {
                row.student_id = row['﻿student_id'];
                delete row['﻿student_id'];
            }

            console.log('Student ID:', row.student_id);

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