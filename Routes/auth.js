const express = require ('express');
const router = express.Router('');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
const connection = require('../db');
const pool = require('../db');
require('dotenv').config();

// Ruta para iniciar sesión
router.post('/login', (req, res) => {
    //const { username, password } = req.body;
    const { email, password } = req.body;

    // Comprobar que el cuerpo de la solicitud tiene los campos necesarios
    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, proporcione un correo valido y una contraseña' });
    }

     console.log(`Buscando email con: ${email}`, `Buscando email con contraseña: ${password}`);

    const query = `SELECT * FROM usuarios WHERE email = ?`;
    connection.query(query, [email], async (err, results) => {
        if (err) {
            console.error(`Error en la consulta SQL: ${err.message}`);
            return res.status(500).json({ error: err.message });
        }

         console.log(`Resultados de la consulta para email ${email}:`);

        if (results.length === 0) {
            console.log(`email no encontrado: ${email}`);
            return res.status(401).json({ message: 'email no encontrado' });
        }

          const user = results[0];
          console.log(`Usuario encontrado:`, user);

        try {
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }
            // Crear el token JWT
            const token = jwt.sign(
                { id: user.user_id, email: user.email, tipo: user.user_types }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            res.status(200).json({ message: 'Autenticación exitosa', token, user });
            
        } catch (compareError) {
            console.error('Error al comparar contraseñas:', compareError);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });
});

// // Ruta para registrar un nuevo usuario
// router.post('/register', async (req, res) => {
//     const { 
//         user_id, 
//         name, 
//         firstname, 
//         lastname ,
//         email, 
//         password, 
//         user_types } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ message: 'Por favor, proporcione un correo valido y una contraseña' });
//     }

//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const query = `INSERT INTO Usuarios (user_id, name, firstname, lastname, email, password, user_types)
//         VALUES (?, ?, ?, ?, ?, ?, ?)`;

//         connection.query(query, [user_id, name, firstname, lastname, email, hashedPassword, user_types], (err, results) => {
//             if (err) {
//                 console.error(`Error en la consulta SQL: ${err.message}`);
//                 return res.status(500).json({ error: err.message });
//             }
//             res.status(201).json({ message: 'Usuario registrado exitosamente' });
//         });
//     } catch (err) {
//         console.error(`Error al hashear la contraseña: ${err.message}`);
//         res.status(500).json({ error: err.message });
//     }
// });


router.post('/register', async (req, res) => {
    const { 
        user_id, 
        name, 
        firstname, 
        lastname, 
        email, 
        password, 
        user_types 
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, proporcione un correo válido y una contraseña' });
    }

    try {
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Query para insertar un nuevo usuario
        const query = `INSERT INTO Usuarios (user_id, name, firstname, lastname, email, password, user_types)
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;

        // Usar el pool para realizar la consulta
        pool.query(query, [user_id, name, firstname, lastname, email, hashedPassword, user_types], (err, results) => {
            if (err) {
                console.error(`Error en la consulta SQL: ${err.message}`);
                return res.status(500).json({ error: 'Error al registrar el usuario' });
            }

            // Devolver un mensaje de éxito
            res.status(201).json({ message: 'Usuario registrado exitosamente' });
        });
    } catch (err) {
        console.error(`Error al hashear la contraseña: ${err.message}`);
        res.status(500).json({ error: 'Error interno al registrar el usuario' });
    }
});

module.exports = router;
