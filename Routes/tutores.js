const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const pool = require('../db');

// Ruta para obtener registro de tutores
router.get('/', (req, res) => {
    const query = `SELECT * 
    FROM Tutores
    ORDER BY firstname`;

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(200).json(results);
    });
});

// Ruta para buscar Tutor
router.get('/buscar', (req, res) => {
    const query = req.query.query;

    // Si no se envía ninguna consulta, no realizar la búsqueda
    if (!query || query.trim() === '') {
        return res.status(400).json({ message: 'Debe proporcionar un término de búsqueda' });
    }

    const sql = `SELECT * FROM Tutores 
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

// Ruta para obtener registro de tutor por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    const query = `SELECT * FROM Tutores WHERE parent_id = ?`;

    pool.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({ message: 'No existe tutor con ese ID' });
        }
    });
});


// Ruta para crear un nuevo Tutor
router.post('/crear', (req, res) => {
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
    };

    if (!tutor.parent_id || tutor.parent_id.trim() === '' || !tutor.name || tutor.name.trim() === '') {
        return res.status(400).json({
            message: 'Todos los campos son obligatorios y no pueden estar vacíos'
        });
    }

    const query = `INSERT INTO Tutores (parent_id, name, firstname, lastname, adress, telephone, email, celphone, description)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
    ];

    pool.query(query, values, (error, results) => {
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
router.put('/actualizar/:id', (req, res) => {
    const { id } = req.params;

    const { name, firstname, lastname, adress, telephone, email, celphone, description } = req.body;
    
    if (!name || name.trim() === '' || !firstname || firstname.trim() === '') {
        return res.status(400).json({
            message: 'Todos los campos son obligatorios y no pueden estar vacíos'
        });
    }

    const query = `UPDATE Tutores SET name = ?, firstname = ?, lastname = ?, adress = ?, telephone = ?, email = ?, celphone = ?, description = ?
                   WHERE parent_id = ?`;

    const values = [
        name,
        firstname,
        lastname,
        adress,
        telephone,
        email,
        celphone,
        description,
        id
    ];

    pool.query(query, values, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(200).json({
            message: 'Tutor actualizado correctamente',
            data: results
        });
    });
});
   
 
// Ruta para borrar un registro de alumno por ID
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM Tutores WHERE parent_id = ?`;

    pool.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(200).json({
            message: 'Tutor borrado correctamente',
            data: results
        });
    });
});


module.exports = router;