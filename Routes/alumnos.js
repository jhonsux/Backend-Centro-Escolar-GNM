const express = require('express');
const router = express.Router('');
const verifyToken = require('../middlewares/verifyToken');
const connection = require('../db');
const pool = require('../db');
require('dotenv').config();


// Ruta para obtener todos los registros de Alumnos
router.get('/', verifyToken, (req, res) => {
    const query = `SELECT Alumnos.student_id, Alumnos.name, Alumnos.firstname, Alumnos.lastname, Alumnos.sex, Alumnos.status, Alumnos.group_id, 
    Semestres.semester AS semestre, Alumnos.parent_id
                   FROM Alumnos 
                   JOIN Semestres ON Alumnos.semester_id = Semestres.semester_id
                   ORDER BY Alumnos.group_id`;

    // Usando pool en lugar de connection
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if (results.length > 0) { // Verifica si hay resultados
            res.status(200).json(results);
        } else {
            res.status(404).json('No existen datos');
        }
    });
});

// Ruta para obtener todos los alumnos graduados
router.get('/graduados', verifyToken, (req, res) => {
    // const query = `SELECT Alumnos.student_id, Alumnos.name, Alumnos.firstname, Alumnos.lastname, Alumnos.sex, Alumnos.status, Alumnos.group_id, 
    // Semestres.semester AS semestre, Alumnos.parent_id
    //                FROM Alumnos 
    //                JOIN Semestres ON Alumnos.semester_id = Semestres.semester_id
    //                ORDER BY Alumnos.group_id`;
    const query = `SELECT *
                   FROM Alumnos`;

    // Usando pool en lugar de connection
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if (results.length > 0) { // Verifica si hay resultados
            res.status(200).json(results);
        } else {
            res.status(404).json('No existen datos');
        }
    });
});

// Ruta para buscar Alumnos
router.get('/buscar', (req, res) => {
    const query = req.query.query;

    // Si no se envía ninguna consulta, no realizar la búsqueda
    if (!query || query.trim() === '') {
        return res.status(400).json({ message: 'Debe proporcionar un término de búsqueda' });
    }

    const sql = `SELECT * FROM Alumnos 
                 WHERE CONCAT(name, ' ', firstname, ' ', lastname) LIKE ? 
                 OR name LIKE ? 
                 OR firstname LIKE ? 
                 OR lastname LIKE ?`;

    const values = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

    // Usando pool en lugar de connection
    pool.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        
        if (results.length > 0) { // Verifica si hay resultados
            res.status(200).json(results);
        } else {
            res.status(404).json({
                message: 'No existe alumno con ese nombre'
            });
        }
    });
});

// Ruta para obtener un alumno por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    console.log('Buscando alumno con ID:', id);

    const query = `SELECT * FROM Alumnos WHERE student_id = ?`;

    pool.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({
                message: 'No existe alumno con ese ID'
            });
        }
    });
});

// Ruta para crear un alumno
router.post('/crear', verifyToken, (req, res) => {
    const alumno = { 
        student_id: req.body.student_id,
        name: req.body.name,
        firstname: req.body.firstname, 
        lastname: req.body.lastname, 
        sex: req.body.sex,
        status: req.body.status, 
        group_id: req.body.group_id,
        semester_id: req.body.semester_id,
        parent_id: req.body.parent_id
    };

    if (!alumno.student_id || alumno.student_id.trim() === '' || !alumno.parent_id || alumno.parent_id.trim() === '') {
        return res.status(400).json({
            message: 'Todos los campos son obligatorios y no pueden estar vacíos'
        });
    }

    const query = `INSERT INTO Alumnos (student_id, name, firstname, lastname, sex, status, group_id, semester_id, parent_id)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        alumno.student_id,
        alumno.name,
        alumno.firstname,
        alumno.lastname,
        alumno.sex,
        alumno.status,
        alumno.group_id,
        alumno.semester_id,
        alumno.parent_id
    ];

    pool.query(query, values, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
            message: 'Alumno creado correctamente'
        });
    });
});

// ruta para actualixar registro de alumno por Id
router.put('/actualizar/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { name, firstname, lastname, sex, status, group_id, semester_id, parent_id } = req.body;

    if (!name || name.trim() === '' || !parent_id || parent_id.trim() === '') {
        return res.status(400).json({
            message: 'Todos los campos son obligatorios y no pueden estar vacíos'
        });
    }

    const query = `UPDATE Alumnos 
                   SET name = ?, firstname = ?, lastname = ?, sex = ?, status = ?, group_id = ?, semester_id = ?, parent_id = ? 
                   WHERE student_id = ?`;

    const values = [name, firstname, lastname, sex, status, group_id, semester_id, parent_id, id];

    pool.query(query, values, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
            message: 'Alumno se actualizó correctamente',
            data: results
        });
    });
});

// Ruta para borrar un registro de alumno por ID
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM Alumnos WHERE student_id = ?`;

    pool.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(200).json({
            message: 'Alumno se borró correctamente',
            data: results
        });
    });
});

// Ruta para obtener el reporte del alumno
router.get('/reporte/:id', (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM Alumnos WHERE student_id = ?`;

    pool.query(query, [id], (error, results) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        if (results.length === 0) {
            return res.status(404).send('Recurso no encontrado');
        }
        res.json(results[0]);
    });
});

// Ruta para obtener el reporte del alumno por ID reporte
router.get('/:id/reportes', (req, res) => {
    const { id } = req.params;

    const query = `SELECT report_id, student_id, i.type_name AS incidencia, u.name AS user, Reportes.description, justificado, date
                   FROM Reportes
                   JOIN Incidencias AS i ON Reportes.type_id = i.type_id
                   JOIN Usuarios AS u ON Reportes.user_id = u.user_id     
                   WHERE student_id = ?`;

    pool.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({
                message: 'No existe reporte con ese ID'
            });
        }
    });
});


module.exports = router;