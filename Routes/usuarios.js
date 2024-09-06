const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const verifyToken = require('../middlewares/verifyToken');
const connection = require('../db');
const pool = require('../db');
require('dotenv').config();

// Ruta para consultar Usuarios
router.get('/usuarios', (req, res) => {

    const query = `SELECT *
    FROM Usuarios`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(200).json(results);
    });
})

router.get('/ping', (req, res) => {
    res.send(' ping has result')
})

// Ruta para consultar Usuario con ID
router.get('/usuarios/:id', (req, res) => {
    const { id } = req.params;

    // Query para seleccionar el usuario por ID, usando parámetros preparados para evitar inyección SQL
    const query = `SELECT * FROM Usuarios WHERE user_id = ?`;

    // Ejecutar la consulta usando el pool
    pool.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }

        // Verificar si hay resultados
        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({ message: 'No existe usuario con ese ID' });
        }
    });
});



// router.put('/usuarios/actualizar/:id',verifyToken, (req, res) => {
router.put('/usuarios/actualizar/:id', async (req, res) => {
    const { 
        name, 
        firstname, 
        lastname,
        email, 
        password, 
        user_types 
    } = req.body;
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'ID de usuario no proporcionado' });
    }

    try {
        let updateFields = [name, firstname, lastname, email, user_types];
        let query = `UPDATE Usuarios SET name = ?, firstname = ?, lastname = ?, email = ?, user_types = ?`;

        // Si se proporciona una nueva contraseña, hashearla y agregarla a la consulta de actualización
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += `, password = ?`;
            updateFields.push(hashedPassword);
        }

        query += ` WHERE user_id = ?`;
        updateFields.push(id);

        connection.query(query, updateFields, (err, results) => {
            if (err) {
                console.error(`Error en la consulta SQL: ${err.message}`);
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Usuario actualizado exitosamente' });
            console.log(password)
        });
    } catch (err) {
        console.error(`Error al actualizar el usuario: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});


// Ruta pra eliminar usuario por ID
router.delete('/usuarios/:id',verifyToken, (req, res) => {

    const { id } = req.params

    const query = `DELETE FROM Usuarios WHERE user_id='${id}'`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }            
        res.status(201).json({
            message: 'Usuario se borro correctamente',
            data: results
        })
    });
})

module.exports = router;