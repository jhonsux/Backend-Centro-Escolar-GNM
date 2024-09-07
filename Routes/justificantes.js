const express = require('express');
const router = express.Router('');
const verifyToken = require('../middlewares/verifyToken');
const connection = require('../db');
const pool = require('../db');
require('dotenv').config();

// Ruta para obtener Incidencias
router.get('/', verifyToken, (req, res) => {
    const query = `SELECT reportes.report_id, Alumnos.student_id, Alumnos.name, Alumnos.firstname, Alumnos.lastname, Justificantes.issue_date, Justificantes.description
                   FROM Justificantes
                   JOIN reportes ON Justificantes.report_id = reportes.report_id
                   JOIN Alumnos ON Justificantes.student_id = Alumnos.student_id`;

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(200).json(results);
    });
});


// Ruta para crear una Incidencia
router.post('/crear', verifyToken, (req, res) => {
    const justificante = {
        report_id: req.body.report_id,
        student_id: req.body.student_id,
        issue_date: req.body.issue_date,
        description: req.body.description
    };

    const query = `INSERT INTO Justificantes (report_id, student_id, issue_date, description)
                   VALUES (?, ?, ?, ?)`;

    const values = [
        justificante.report_id,
        justificante.student_id,
        justificante.issue_date,
        justificante.description
    ];

    pool.query(query, values, (error, results) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    message: 'El report_id ya existe'
                });
            } else {
                console.error('Error en la consulta SQL:', error);
                return res.status(500).send('Error en la consulta SQL');
            }
        }

        res.status(201).json({
            message: 'Justificante creado correctamente'
        });
    });
});


module.exports = router;