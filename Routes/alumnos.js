const express = require('express');
const router = express.Router('');
const verifyToken = require('../middlewares/verifyToken');
const connection = require('../db');
require('dotenv').config();


// Ruta para obtener todos los registros de alumnos
router.get('/', verifyToken, (req, res) => {

    const query = `SELECT alumnos.student_id, alumnos.name, alumnos.firstname, alumnos.lastname, alumnos.sex, alumnos.status, alumnos.group_id, semestres.semester AS semestre, alumnos.parent_id
    FROM Alumnos 
    JOIN semestres ON alumnos.semester_id = semestres.semester_id
    ORDER BY alumnos.group_id`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }if (results != 0) { // Verifica si hay resultados
            res.status(200).json(results); 
        } else {
            res.status(404).json(`No existen Datos`);
        }
    });
});

// Ruta para buscar alumnos
router.get('/buscar', (req, res) => {
    const query = req.query.query;

    // Si no se envía ninguna consulta, no realizar la búsqueda
    if (!query || query.trim() === '') {
        return res.status(400).json({ message: 'Debe proporcionar un término de búsqueda' });
    }

    const sql = `SELECT * FROM alumnos 
    WHERE CONCAT(name, ' ', firstname, ' ', lastname) LIKE ? 
    OR name LIKE ? 
    OR firstname LIKE ? 
    OR lastname LIKE ?`;

    const values = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

    connection.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        
        if (results.length > 0) {  // Verifica si hay resultados
            res.status(200).json(results);
        } else {
            res.status(404).json({
                message: 'No existe Alumno con ese Nombre'
            });
        }
    });
});


// Ruta para obtener un registro de alumnos por ID
// router.get('/parent/:id', (req, res) => {

//     const { id } = req.params;

//     console.log('Buscando alumno con ID:', id); // Agrega esta línea para depuración

//     const query = `SELECT alumnos.student_id, alumnos.name, alumnos.firstname, alumnos.lastname, alumnos.sex, alumnos.status, alumnos.group_id, semestres.semester, tutores.parent_id, tutores.name AS tutor, tutores.firstname AS apellido, tutores.adress, tutores.telephone, tutores.email, tutores.celphone, tutores.description
//     FROM alumnos 
//     JOIN semestres ON alumnos.semester_id = semestres.semester_id 
//     JOIN Tutores ON alumnos.parent_id = Tutores.parent_id
//     WHERE student_id = '${id}'`

//     connection.query(query, (error, results) => {
//         if (error) {
//             console.error('Error en la consulta SQL:', error);
//             return res.status(500).send('Error en la consulta SQL');
//         }
//         if(results != 0){
//             res.status(200).json(results)
//         } else {
//             res.status(404).json({
//                 message: 'No existe alumno con ese ID'
//             });
//         }
//     });
// });

router.get('/:id', (req, res) => {

    const { id } = req.params;

    console.log('Buscando alumno con ID:', id); // línea para depuración

    const query = `SELECT * 
    FROM alumnos
    WHERE student_id = '${id}'`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if (results.length > 0) { // Verifica si hay resultados
            res.status(200).json(results); 
        } else {
            res.status(404).json({
                message: 'No existe alumno con ese ID'
            });
        }
    });
});


// Ruta para crear un nuevo registro alumno
router.post('/crear',verifyToken, (req, res) => {

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
     } 

         // Verificar si alguno de los campos obligatorios está vacío o contiene solo espacios en blanco
    if (
        !alumno.student_id || alumno.student_id.trim() === '' ||
        !alumno.parent_id || alumno.parent_id.trim() === ''
    ) {
        return res.status(400).json({
            message: 'Todos los campos son obligatorios y no pueden estar vacíos'
        });
    }

    const query = `INSERT INTO Alumnos (student_id, name, firstname, lastname, sex, status, group_id, semester_id, parent_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

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

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
          message: 'Alumno creado correctamente' 
        })
    });
});

// ruta para actualixar registro de alumno por Id
router.put('/actualizar/:id',verifyToken, (req, res) => {

    const { id } = req.params;

    const { name, firstname, lastname, sex, status, group_id, semester_id, parent_id } = req.body;

    const query = `UPDATE alumnos SET name ='${name}', firstname ='${firstname}', lastname ='${lastname}', sex = '${sex}', status ='${status}', group_id='${group_id}', semester_id='${semester_id}', parent_id='${parent_id}'
    WHERE student_id='${id}'`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
            message: 'Alumno se actualizo correctamente',
            data: results
        })
    });
});

// Ruta para borrar un registro de alumno por ID
router.delete('/:id',verifyToken, (req, res) => {

    const { id } = req.params;

    const query = `DELETE FROM Alumnos WHERE student_id='${id}'`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(200).json({
            message: 'Alumno se borro correctamente',
            data: results
        })
    });
});

// Ruta para obtener el reporte del alumno
router.get('/reporte/:id', (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM alumnos WHERE student_id = ?`;
  
    connection.query(query, [id], (error, results) => {
      if (error) {
        return res.status(500).send(error.message);
      }
      if (results.length === 0) {
        return res.status(404).send('Recurso no encontrado');
      }
      // Aquí puedes generar el reporte basado en los resultados
      res.json(results[0]); // Enviar los datos del alumno como ejemplo
    });
  });

// Ruta para obtener el reporte del alumno por ID reporte
router.get('/:id/reportes', (req, res) => {
    const { id } = req.params;
    const query = `SELECT report_id, student_id, i.type_name AS incidencia, u.name AS user, reportes.description, justificado, date
    FROM reportes
    JOIN tipos_incidencias AS i ON reportes.type_id = i.type_id
    JOIN usuarios AS u ON reportes.user_id = u.user_id     
    WHERE student_id = '${id}'`;

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if(results != 0){
            res.status(200).json(results)
        } else {
            res.status(404).json({
            message: 'No existe reporte con ese ID'
            });
        }
    });
});


module.exports = router;