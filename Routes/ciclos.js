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
    const query = `SELECT * FROM Ciclos_Escolares`;

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json(results);
    });
});

// Ruta para Crear un nuevo Ciclo
router.post('/crear-ciclo', verifyToken, (req, res) => {
    const { fecha_inicio, fecha_fin } = req.body;

    pool.getConnection((error, connection) => {
        if (error) {
            console.error('Error al obtener la conexión del pool:', error);
            return res.status(500).send('Error al obtener la conexión');
        }

        connection.beginTransaction(error => {
            if (error) {
                console.error('Error al iniciar la transacción:', error);
                connection.release();
                return res.status(500).send('Error al iniciar la transacción');
            }

            const queryCiclo = `INSERT INTO Ciclos_Escolares (fecha_inicio, fecha_fin) VALUES (?, ?)`;
            connection.query(queryCiclo, [fecha_inicio, fecha_fin], (error, results) => {
                if (error) {
                    console.error('Error al crear ciclo escolar:', error);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send('Error al crear ciclo escolar');
                    });
                }

                connection.commit(error => {
                    if (error) {
                        console.error('Error al hacer commit:', error);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send('Error al finalizar la transacción');
                        });
                    }

                    connection.release();
                    res.status(201).json({
                        message: 'Ciclo escolar creado correctamente',
                        ciclo_escolar_id: results.insertId
                    });
                });
            });
        });
    });
});

// buscar ciclo escolar por id
router.get('/:id', verifyToken, (req, res) => {
    const id = req.params.id;
    const queryBuscarCiclo = `SELECT * FROM Ciclos_Escolares WHERE cicle_id = ?`;

    pool.query(queryBuscarCiclo, [id], (error, results) => {
        if (error) {
            console.error('Error al buscar ciclo escolar:', error);
            return res.status(500).send('Error al buscar ciclo escolar');
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: 'Ciclo escolar no encontrado'
            });
        }

        res.status(200).json({
            message: 'Ciclo escolar encontrado',
            ciclo_escolar: results[0]
        });
    });
});

// crear periodo escolar
router.post('/crear-periodo', verifyToken, (req, res) => {
    const { nombre, fecha_inicio, fecha_fin, cicle_id } = req.body;

    pool.getConnection((error, connection) => {
        if (error) {
            console.error('Error al obtener la conexión del pool:', error);
            return res.status(500).send('Error al obtener la conexión');
        }

        connection.beginTransaction(error => {
            if (error) {
                console.error('Error al iniciar la transacción:', error);
                connection.release();
                return res.status(500).send('Error al iniciar la transacción');
            }

            const queryPeriodo = `INSERT INTO Periodos_Escolares (nombre, fecha_inicio, fecha_fin, cicle_id) VALUES (?, ?, ?, ?)`;
            connection.query(queryPeriodo, [nombre, fecha_inicio, fecha_fin, cicle_id], (error, results) => {
                if (error) {
                    console.error('Error al crear periodo escolar:', error);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send('Error al crear periodo escolar');
                    });
                }
                connection.release();
                    res.status(201).json({
                        message: 'Periodo escolar creado y semestres actualizados correctamente'
                    });
            });
        });
    });
});





module.exports = router;