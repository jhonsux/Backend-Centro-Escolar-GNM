const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const connection = require('../db');

// Ruta para obtener registro de tutores
router.get('/tutores', (req, res) => {

    const query = `SELECT *
    FROM Tutores`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json(results);
    });
})

// Ruta para obtener registro de tutor por ID
router.get('/tutores/:id', (req, res) => {
    const { id } = req.params;

    const query = `SELECT *
    FROM Tutores 
    WHERE parent_id = '${id}';`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if (results.length > 0) { // Verifica si hay resultados
            res.status(200).json(results); 
        } else {
            res.status(404).json(`No existe tutor con ese ID`);
        }
    });
})

// Ruta para crear un nuevo Tutor
router.post('/tutores/crear', (req, res) => {

    const tutor = { 
        parent_id: req.body.parent_id,
        name: req.body.name,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        adress: req.body.adress,
        telephone: req.body.telephone,
        email: req.body.email,
        celphone: req.body.celphone,
        description: req.body.description
     }

    const query = `INSERT INTO Tutores (parent_id, name, firstname, lastname, adress, telephone, email, celphone, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

    const values = [
        tutor.parent_id,
        tutor.name,
        tutor.firstname,
        tutor.lastname,
        tutor.adress,
        tutor.telephone,
        tutor.email,
        tutor.celphone,
        tutor.description
    ]

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
            message: 'Tutor creado correctamente',
            data: results
        });
    });
});

//ruta para actualizar un registro de tutores por ID
router.put('/tutores/actualizar/:id', (req, res) => {

    const { id } = req.params

    const { name, firstname, lastname, adress, telephone, email, celphone, description} = req.body;

    const query = `UPDATE Tutores set name = '${name}', firstname = '${firstname}', lastname = '${lastname}', adress = '${adress}', telephone = '${telephone}', email = '${email}', celphone = '${celphone}', description = '${description}' 
    WHERE parent_id = '${id}';`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
            message: 'Tutor se actualizo correctamente',
            data: results
        })
    });
})     
 
// Ruta para borrar un registro de alumno por ID
router.delete('/tutores/:id', (req, res) => {

    const { id } = req.params;

    const query = `DELETE FROM Tutores WHERE parent_id=${id}`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
            message: 'Tutor se borro correctamente',
            data: results
        })
    });
});

module.exports = router;