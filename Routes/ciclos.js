const express = require('express');
const router = express.Router('');
const verifyToken = require('../middlewares/verifyToken');
const pool = require('../db');
require('dotenv').config();

// Ruta para obtener todos los Ciclos
router.get('/', verifyToken, (req, res) => {
    const query = `SELECT * FROM Ciclos_Escolares`;

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json(results);
    });
});

// Ruta para Crear un nuevo Ciclo
router.post('/crear-ciclo', verifyToken, (req, res) => {
    const { fecha_inicio, fecha_fin } = req.body;

    pool.getConnection((error, connection) => {
        if (error) {
            console.error('Error al obtener la conexión del pool:', error);
            return res.status(500).send('Error al obtener la conexión');
        }

        connection.beginTransaction(error => {
            if (error) {
                console.error('Error al iniciar la transacción:', error);
                connection.release();
                return res.status(500).send('Error al iniciar la transacción');
            }

            const queryCiclo = `INSERT INTO Ciclos_Escolares (fecha_inicio, fecha_fin) VALUES (?, ?)`;
            connection.query(queryCiclo, [fecha_inicio, fecha_fin], (error, results) => {
                if (error) {
                    console.error('Error al crear ciclo escolar:', error);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send('Error al crear ciclo escolar');
                    });
                }

                connection.commit(error => {
                    if (error) {
                        console.error('Error al hacer commit:', error);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send('Error al finalizar la transacción');
                        });
                    }

                    connection.release();
                    res.status(201).json({
                        message: 'Ciclo escolar creado correctamente',
                        ciclo_escolar_id: results.insertId
                    });
                });
            });
        });
    });
});

// Ruta para Editar un Ciclo
router.put('/actualizar/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin  } = req.body;

    const query = `UPDATE Ciclos SET fecha_inicio = ?, fecha_fin = ? WHERE cicle_id = ?`;

    pool.query(query, [fecha_inicio, fecha_fin, id], (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }
        res.status(201).json({
            message: 'Ciclo actualizado correctamente',
            data: results
        });
    });
});

// Ruta para Borrar un Ciclo
router.delete('/:id', verifyToken, (req, res) => {

    const { id } = req.params

    const query = `DELETE FROM Ciclos WHERE cicle_id = ${id}`

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            return res.status(500).send('Error en la consulta SQL');
        }            
        res.status(201).json({
            message: 'Ciclo se borro correctamente',
            data: results
        })
    });
})

// buscar ciclo escolar por id
router.get('/:id', verifyToken, (req, res) => {
    const id = req.params.id;
    const queryBuscarCiclo = `SELECT * FROM Ciclos_Escolares WHERE cicle_id = ?`;

    pool.query(queryBuscarCiclo, [id], (error, results) => {
        if (error) {
            console.error('Error al buscar ciclo escolar:', error);
            return res.status(500).send('Error al buscar ciclo escolar');
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: 'Ciclo escolar no encontrado'
            });
        }

        res.status(200).json({
            message: 'Ciclo escolar encontrado',
            ciclo_escolar: results[0]
        });
    });
});

// Crear periodo escolar y actualizar semestres
router.post('/crear-periodo', verifyToken, (req, res) => {
    const { nombre, fecha_inicio, fecha_fin, cicle_id } = req.body;

    pool.getConnection((error, connection) => {
        if (error) {
            console.error('Error al obtener la conexión del pool:', error);
            return res.status(500).send('Error al obtener la conexión');
        }

        connection.beginTransaction(error => {
            if (error) {
                console.error('Error al iniciar la transacción:', error);
                connection.release();
                return res.status(500).send('Error al iniciar la transacción');
            }

            // Insertar el nuevo periodo escolar
            const queryPeriodo = `INSERT INTO Periodos_Escolares (nombre, fecha_inicio, fecha_fin, cicle_id) VALUES (?, ?, ?, ?)`;
            connection.query(queryPeriodo, [nombre, fecha_inicio, fecha_fin, cicle_id], (error, results) => {
                if (error) {
                    console.error('Error al crear el periodo escolar:', error);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send('Error al crear el periodo escolar');
                    });
                }

                // Actualizar los semestres de los alumnos
                const updateSemestreQuery = `UPDATE Alumnos SET semester_id = semester_id + 1 WHERE semester_id < 7`;
                connection.query(updateSemestreQuery, (error, results) => {
                    if (error) {
                        console.error('Error al actualizar semestres:', error);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send('Error al actualizar semestres');
                        });
                    }

                    // Mover alumnos del 7º semestre a la tabla alumnos_graduados
                    const moveGraduatedQuery = `INSERT INTO alumnos_graduados (student_id, name, firstname, lastname, sex, status, group_id, semester_id, parent_id)
                        SELECT student_id, name, firstname, lastname, sex, status, group_id, semester_id, parent_id
                        FROM Alumnos
                        WHERE semester_id = 7
                    `;
                    connection.query(moveGraduatedQuery, (error, results) => {
                        if (error) {
                            console.error('Error al mover alumnos a alumnos_graduados:', error);
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).send('Error al mover alumnos a alumnos graduados');
                            });
                        }

                        // Eliminar los alumnos del 7º semestre de la tabla alumnos
                        const deleteGraduatedQuery = `DELETE FROM Alumnos WHERE semester_id = 7`;
                        connection.query(deleteGraduatedQuery, (error, results) => {
                            if (error) {
                                console.error('Error al eliminar alumnos del 7º semestre:', error);
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).send('Error al eliminar alumnos del 7º semestre');
                                });
                            }

                            connection.commit(error => {
                                if (error) {
                                    console.error('Error al hacer commit de la transacción:', error);
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).send('Error al hacer commit de la transacción');
                                    });
                                }

                                connection.release();
                                res.status(201).json({
                                    message: 'Periodo escolar creado, semestres actualizados y alumnos graduados movidos correctamente'
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;