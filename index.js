const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const morgan = require('morgan');
app.use(morgan('dev'));


//const routes = require('./routes');
const alumnosRoutes = require('./Routes/alumnos');
const tutoresRoutes = require('./Routes/tutores');
const reportesRoutes = require('./Routes/reportes');
const usuariosRoutes = require('./Routes/usuarios');
const incidenciasRoutes = require('./Routes/incidencias');
const justificantesRoutes = require('./Routes/justificantes');
const comunicadosRoutes = require('./Routes/comunicados');
const ciclosRoutes = require('./Routes/ciclos');
const dataBase = require('./Routes/backup')
const authRoutes = require('./Routes/auth');

require('dotenv').config();

app.use(express.json());
app.use(express.text());


app.use('/alumnos',alumnosRoutes);
app.use(tutoresRoutes);
app.use(reportesRoutes);
app.use(usuariosRoutes);
app.use('/auth',authRoutes);
app.use('/incidencias',incidenciasRoutes);
app.use('/justificantes',justificantesRoutes);
app.use('/ciclos',ciclosRoutes);
app.use(dataBase);
app.use('/comunicados',comunicadosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});

