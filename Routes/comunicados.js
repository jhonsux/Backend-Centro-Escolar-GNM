const express = require('express');
const router = express.Router('');
const verifyToken = require('../middlewares/verifyToken');
const connection = require('../db');
const pool = require('../db');
require('dotenv').config();

 // ruta para ver los datos del comunicado
 router.get('/', (req, res) => {
    const query = `SELECT * FROM Comunicados`;

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json(results);
    });
});


// Ruta para obtener un registro de alumnos por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM Comunicados WHERE parent_id = ?`;

    pool.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if (results.length > 0) {
            res.status(201).json(results);
        } else {
            res.status(404).json({
                message: 'No existe Comunicado con ese ID'
            });
        }
    });
});


  // ruta para crear un tipo de comunicado
  router.post('/crear', (req, res) => {
    const comunicado = {
        communication_id: req.body.comunication_id,
        parent_id: req.body.parent_id,
        date: req.body.date,
        method: req.body.method,
        description: req.body.description
    };

    // Verificar si alguno de los campos obligatorios está vacío o contiene solo espacios en blanco
    if (!comunicado.parent_id || comunicado.parent_id.trim() === '') {
        return res.status(400).json({
            message: 'Todos los campos son obligatorios y no pueden estar vacíos'
        });
    }

    const query = `INSERT INTO Comunicados (communication_id, parent_id, date, method, description) VALUES (?, ?, ?, ?, ?)`;

    const values = [
        comunicado.communication_id,
        comunicado.parent_id,
        comunicado.date,
        comunicado.method,
        comunicado.description
    ];

    pool.query(query, values, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
            message: 'Comunicado Creado Correctamente',
            data: results
        });
    });
});


module.exports = router;