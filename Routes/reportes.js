const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const connection = require('../db');

// Ruta para obtener los registros de reportes
router.get('/reportes', verifyToken, (req, res) => {

    const query = `SELECT report_id, student_id, i.type_name AS incidencia, u.name AS user, reportes.description, justificado, date
    FROM reportes
    JOIN tipos_incidencias AS i ON reportes.type_id = i.type_id
    JOIN usuarios AS u ON reportes.user_id = u.user_id
    ORDER BY justificado`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(200).json(results);
    });
})

// ruta para obtener registro de reporte por ID
router.get('/reportes/:id', (req, res) => {

    const {id} = req.params

    const query = `SELECT report_id, student_id, i.type_name AS incidencia, u.name AS user, reportes.description, justificado, date
    FROM reportes
    JOIN tipos_incidencias AS i ON reportes.type_id = i.type_id
    JOIN usuarios AS u ON reportes.user_id = u.user_id     
    WHERE report_id = '${id}'`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if(results != 0){

            const formato = results.map(reporte => {
                const date = new Date(reporte.date);
                reporte.date = date.toISOString().split('T')[0];
                return reporte
            })

            res.status(201).json(formato)
        } else {
            res.status(401).json({
                message: 'No existe reporte con ese ID'
            });
        }
    });
})

// ruta para crear un reporte
router.post('/reportes/crear',verifyToken, (req, res) => {

    const reporte = {
        report_id: req.body.report_id,
        student_id: req.body.student_id,
        type_id: req.body.type_id,
        user_id: req.body.user_id,
        description: req.body.description,
        date: req.body.date
    }

    // Verificar si alguno de los campos obligatorios está vacío o contiene solo espacios en blanco
    if (
        !reporte.student_id || reporte.student_id.trim() === '' ||
        !reporte.type_id || String(reporte.type_id).trim() === '' ||
        !reporte.date || reporte.date.trim() === ''
    ) {
        return res.status(400).json({
            message: 'Todos los campos son obligatorios y no pueden estar vacíos'
        });
    }

    //const id_usuario = req.user.id; // Obtener el ID del usuario autenticado

    const query = `INSERT INTO Reportes (student_id, type_id, user_id, description, date)
    VALUES (?, ?, ?, ?, ?)`

    const values = [
        reporte.student_id,
        reporte.type_id,
        reporte.user_id,
        reporte.description,
        reporte.date
    ]

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
            message: 'Reporte creado correctamente',
            data: results
        });
    });
})

// ruta para actualizar un reporte por ID
router.put('/reportes/actualizar/:id', (req, res) => {
    const { id } = req.params

    const {justificado} = req.body

    const query = `UPDATE Reportes SET justificado = '${justificado}'
        WHERE report_id = '${id}'`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
            message: 'Reporte se actualizo correctamente',
            data: results
        })
    });
})

// ruta para borrar un reporte por ID
// router.delete('/reportes/:id', (req, res) => {

//     const { id } = req.params

//     const query = `DELETE FROM Reportes WHERE report_id = ${id}`

//     connection.query(query, (error, results) => {
//         if (error) {
//             console.error('Error en la consulta SQL:', error);
//             return res.status(500).send('Error en la consulta SQL');
//         }            
//         res.status(201).json({
//             message: 'Reporte se borro correctamente',
//             data: results
//         })
//     });
// })

module.exports = router;