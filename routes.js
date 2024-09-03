const express = require('express');
const router = express.Router();
const connection = require('./db');

// Ruta para obtener todos los registros de alumnos
router.get('/', (req, res) => {

    const query = `SELECT alumnos.id_alumno, alumnos.nombre, alumnos.apellido_pa, alumnos.apellido_ma, alumnos.estatus, grupos.grupo, semestres.semestre
    FROM alumnos 
    JOIN grupos ON alumnos.Id_grupo = grupos.Id_grupo 
    JOIN semestres ON grupos.Id_semestre = semestres.Id_semestre
    ORDER BY grupo`

    connection.query(query, (error, results) => {
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

    console.log('Buscando alumno con ID:', id); // Agrega esta línea para depuración

    const query = `SELECT alumnos.id_alumno, alumnos.nombre, alumnos.apellido_pa, alumnos.apellido_ma, alumnos.estatus, grupos.grupo, semestres.semestre, tutores.id_tutor, tutores.nombre AS tutor, tutores.apellido_pa AS apellido, tutores.telefono, tutores.celular, tutores.observacion
    FROM alumnos 
    JOIN grupos ON alumnos.Id_grupo = grupos.Id_grupo
    JOIN semestres ON grupos.Id_semestre = semestres.Id_semestre 
    JOIN Tutores ON alumnos.Id_Tutor = Tutores.Id_Tutor
    WHERE Id_alumno = ?`

    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if(results != 0){
            res.status(201).json(results)
        } else {
            res.status(404).json({
                message: 'No existe alumno con ese ID',
                error
            });
        }
    });
});

// Ruta para crear un nuevo registro alumno
router.post('/crear', (req, res) => {

    const alumno = { 
        id_alumno: req.body.id_alumno,
        nombre: req.body.nombre,
        apellido_pa: req.body.apellido_pa, 
        apellido_ma: req.body.apellido_ma, 
        estatus: req.body.estatus, 
        grupo: req.body.grupo, 
        id_tutor: req.body.tutor
     } 

    const query = `INSERT INTO Alumnos (id_alumno, nombre, apellido_pa, apellido_ma, estatus, id_grupo, id_tutor)
    VALUES (?, ?, ?, ?, ?, ?, ?)`

    const values = [
        alumno.id_alumno,
        alumno.nombre,
        alumno.apellido_pa,
        alumno.apellido_ma,
        alumno.estatus,
        alumno.grupo,
        alumno.id_tutor
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
router.put('/actualizar/:id', (req, res) => {

    const { id } = req.params;

    const { nombre, apellido_pa, apellido_ma, estatus, grupo, id_tutor } = req.body;

    if (
        nombre === undefined || 
        apellido_pa === undefined || 
        apellido_ma === undefined || 
        estatus === undefined || 
        grupo === undefined || 
        id_tutor === undefined
    ) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    const query = `UPDATE alumnos SET nombre ='${nombre}', apellido_pa ='${apellido_pa}', apellido_ma ='${apellido_ma}', estatus ='${estatus}', id_grupo='${grupo}', id_tutor='${id_tutor}'
    WHERE id_alumno='${id}'`

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
router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const query = `DELETE FROM Alumnos WHERE id_alumno='${id}'`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
            message: 'Alumno se borro correctamente',
            data: results
        })
    });
});

// Ruta para obtener un registro por ID de alumno
router.get('/reporte/:id', (req, res) => {

    const { id } = req.params;

    const query = `SELECT *
    FROM alumnos
    WHERE Id_alumno = ${id}`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if(results != 0){
            res.status(201).json(results)
        } else {
            res.status(404).json({
                message: 'No existe alumno con ese ID'
            });
        }
    });
});

// Ruta para obtener el reporte del alumno por ID reporte
router.get('/:id/reportes', (req, res) => {
    const { id } = req.params;
    const query = `SELECT id_reporte, incidencia, materia, maestro, falta, justificante, observacion, fecha
                   FROM reportes WHERE Id_Alumno = '${id}'`;

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if(results != 0){
            res.status(201).json(results)
        } else {
            res.status(404).json({
                message: 'No existe alumno con ese ID'
            });
        }
    });
});



// ************************************************************************************************
// Ruta para obtener registro de tutores
router.get('/tutores', (req, res) => {

    const query = `SELECT id_tutor, nombre, apellido_Pa, apellido_Ma, telefono, celular, observacion
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

    const query = `SELECT id_tutor, nombre, apellido_Pa, apellido_Ma, telefono, celular, observacion
    FROM Tutores 
    WHERE id_Tutor = ${id};`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if(results != 0){
            res.status(201).json(results)
        } else {
            res.status(401).json(`No existe tutor con ese ID`);
        }
    });
})

// Ruta para crear un nuevo Tutor
router.post('/tutores/crear', (req, res) => {

    const tutor = { 
        id_tutor: req.body.id_tutor,
        nombre: req.body.nombre,
        apellido_pa: req.body.apellido_pa,
        apellido_ma: req.body.apellido_ma,
        telefono: req.body.telefono,
        celular: req.body.celular,
        observacion: req.body.observacion
     }

    const query = `INSERT INTO Tutores (id_tutor, nombre, apellido_pa, apellido_ma, telefono, celular, observacion)
    VALUES (?, ?, ?, ?, ?, ?, ?)`

    const values = [
        tutor.id_tutor,
        tutor.nombre,
        tutor.apellido_pa,
        tutor.apellido_ma,
        tutor.telefono,
        tutor.celular,
        tutor.observacion
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

    const { nombre, apellido_pa, apellido_ma, telefono, celular, observacion} = req.body;

    if (
        nombre === undefined || 
        apellido_pa === undefined || 
        apellido_ma === undefined || 
        celular === undefined
    ) {
        return res.status(400).send('Los campos son requeridos');
    }

    const query = `UPDATE Tutores set nombre = '${nombre}', apellido_pa = '${apellido_pa}', Apellido_Ma = '${apellido_ma}', Telefono = '${telefono}', Celular = '${celular}', observacion = '${observacion}' 
    WHERE id_tutor = '${id}';`

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
 
// Ruta para borrar un registro de tutor por ID
router.delete('/tutores/:id', (req, res) => {

    const { id } = req.params;

    const query = `DELETE FROM Tutores WHERE id_Tutor=${id}`

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


// **********************************************************************************************
// Ruta para consultar Usuarios
router.get('/usuarios', (req, res) => {

    const query = `SELECT id_usuario, nombre, apellido_pa , apellido_ma, usuario , password, tipo_usuario
    FROM usuarios`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json(results);
    });
})

// Ruta para consultar Usuario con ID
router.get('/usuarios/:id', (req, res) => {

    const { id } = req.params

    const query = `SELECT nombre, apellido_pa, apellido_ma, usuario, password, tipo_usuario
    FROM usuarios 
    WHERE id_usuario = '${id}'`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if(results != 0){
            res.status(201).json(results)
        } else {
            res.status(404).json({
                message: 'No existe usuario con ese ID',
                data: results
            });
        }
    });
})

// Ruta para craer un usuario 
router.post('/usuarios/crear', (req, res) => {

    const usuario = {
        id_usuaro: req.body.id_usuaro,
        nombre: req.body.nombre,
        apellido_pa: req.body.apellido_pa,
        apellido_ma: req.body.apellido_ma,
        usuario: req.body.usuario,
        password: req.body.password,
        tipo_usuario: req.body.tipo_usuario
    }

    const query = `INSERT INTO Usuarios (id_usuario, nombre, apellido_pa, apellido_ma, usuario, password, tipo_usuario)
    VALUES (?, ?, ?, ?, ?, ?, ?)`

    const values = [
        usuario.id_usuaro,
        usuario.nombre,
        usuario.apellido_pa,
        usuario.apellido_ma,
        usuario.usuario,
        usuario.password,
        usuario.tipo_usuario
    ];

    connection.query(query, values, (error, results) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    message: 'El usuario ya existe. Por favor, elige otro nombre de usuario.'
                });
            } else {
                console.error('Error en la consulta SQL:', error.message);
                return res.status(500).send('Error en la consulta SQL');
            }
        }
        res.status(201).json({
            message: 'Usuario creado correctamente',
            data: results
        });
    });
})

// ruta para actualizar usuario por ID
router.put('/usuarios/actualizar/:id', (req, res) => {

    const { id } = req.params

    const { nombre, apellido_pa, apellido_ma, usuario, password, tipo_usuario} = req.body;

    if (
        nombre === undefined || 
        apellido_pa === undefined || 
        apellido_ma === undefined || 
        usuario === undefined ||
        password === undefined ||
        tipo_usuario === undefined
    ) {
        return res.status(400).send('Los campos son requeridos');
    }

    const query = `UPDATE Usuarios SET nombre = '${nombre}', apellido_pa = '${apellido_pa}', apellido_ma = '${apellido_ma}', usuario = '${usuario}', password = '${password}', tipo_usuario = '${tipo_usuario}'
    WHERE id_usuario = '${id}'`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
            message: 'Usuario se actualizo correctamente',
            data: results
        })
    });
})

// Ruta pra eliminar usuario por ID
router.delete('/usuarios/:id', (req, res) => {

    const { id } = req.params

    const query = `DELETE FROM Usuarios WHERE id_usuario=${id}`

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


// ********************************************************************************************
// Ruta para obtener los registros de reportes
router.get('/reportes', (req, res) => {

    const query = `SELECT id_reporte, alumnos.nombre, alumnos.apellido_pa, incidencia, materia, maestro, falta, justificante, usuarios.tipo_usuario, observacion, fecha
    FROM reportes
    JOIN alumnos ON reportes.Id_Alumno = alumnos.Id_Alumno
    JOIN usuarios ON reportes.Id_Usuario = usuarios.Id_Usuario`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json(results);
    });
})

// ruta para obtener registro de reporte por ID
router.get('/reportes/:id', (req, res) => {

    const {id} = req.params

    const query = `SELECT alumnos.nombre, alumnos.apellido_pa, incidencia, materia, maestro, falta, justificante, usuarios.tipo_usuario, observacion, fecha
    FROM reportes
    JOIN alumnos ON reportes.Id_alumno = alumnos.id_alumno
    JOIN usuarios ON reportes.Id_usuario = usuarios.id_usuario
    WHERE id_reporte = '${id}'`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        if(results != 0){
            res.status(201).json(results)
        } else {
            res.status(401).json({
                message: 'No existe reporte con ese ID'
            });
        }
    });
})

// ruta para crear un reporte
router.post('/reportes/crear', (req, res) => {

    const reporte = {
        id_reporte: req.body.id_reporte,
        id_alumno: req.body.id_alumno,
        nombre: req.body.nombre,
        incidencia: req.body.incidencia,
        materia: req.body.materia,
        maestro: req.body.maestro,
        falta: req.body.falta,
        justificante: req.body.justificante,
        id_usuario: req.body.id_usuario,
        observacion: req.body.observacion,
        fecha: req.body.fecha
    }

    const query = `INSERT INTO Reportes (id_reporte, id_alumno, incidencia, materia, maestro, falta, justificante, id_usuario, observacion, fecha)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    const values = [
        reporte.id_reporte,
        reporte.id_alumno,
        reporte.incidencia,
        reporte.materia,
        reporte.maestro,
        reporte.falta,
        reporte.justificante,
        reporte.id_usuario,
        reporte.observacion,
        reporte.fecha
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

    const {incidencia, materia, maestro, falta, justificante, observacion, fecha} = req.body

    if (
        incidencia === undefined || 
        materia === undefined || 
        materia === undefined || 
        maestro === undefined ||
        fecha === undefined 
    ) {
        return res.status(400).send('Los campos son requeridos');
    }

    const query = `UPDATE Reportes SET incidencia = '${incidencia}', materia = '${materia}', maestro = '${maestro}', falta = '${falta}', justificante = '${justificante}', observacion = '${observacion}', fecha = '${fecha}'
        WHERE Id_Reporte = '${id}'`

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
router.delete('/reportes/:id', (req, res) => {

    const { id } = req.params

    const query = `DELETE FROM Reportes WHERE id_reporte = ${id}`

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }            
        res.status(201).json({
            message: 'Reporte se borro correctamente',
            data: results
        })
    });
})

module.exports = router;
