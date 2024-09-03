const mysql = require('mysql2')

    const conexion = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'jhon1',
        database: 'centro_escolar'
    })


conexion.connect(error => {
    if(error) throw error
    console.log('conexion a mysql')
});

module.exports = conexion;