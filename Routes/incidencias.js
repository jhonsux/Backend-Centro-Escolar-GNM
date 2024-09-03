const express = require('express');
const router = express.Router('');
const verifyToken = require('../middlewares/verifyToken');
const connection = require('../db');
require('dotenv').config();

// Ruta para buscar incidencias
router.get('/buscar', (req, res) => {
    const query = req.query.query;
    const sql = `SELECT * FROM tipos_incidencias WHERE type_id LIKE ? OR type_name LIKE ?`;
    const values = [`%${query}%`, `%${query}%`];
  
    connection.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if(results != 0){
            res.status(201).json(results)
        } else {
            res.status(404).json({
            message: 'No existe incidencia con ese Nombre o id'
            });
        }
    });
  });

  // ruta para crear un tipo de incidencia
router.post('/crear', (req, res) => {

    const incidencia = {
        type_id: req.body.type_id,
        type_name: req.body.type_name,
        description: req.body.description
    }

    const query = `INSERT INTO tipos_incidencias (type_id, type_name, description)
    VALUES (?, ?, ?)`

    const values = [
        incidencia.type_id,
        incidencia.type_name,
        incidencia.description
    ]

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
            message: 'typo de incidencia creado correctamente',
            data: results
        });
    });

})


  module.exports = router;