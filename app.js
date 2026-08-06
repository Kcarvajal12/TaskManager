const express = require('express');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

const PORT = 3000;


// ======================================
// CONFIGURACIÓN DE EJS
// ======================================

app.set('view engine', 'ejs');

app.set(
    'views',
    path.join(__dirname, 'views')
);


// ======================================
// FORMULARIOS
// ======================================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());


// ======================================
// ARCHIVOS PÚBLICOS
// ======================================

app.use(
    express.static(
        path.join(__dirname, 'public')
    )
);


// ======================================
// SESIONES
// ======================================

app.use(
    session({
        secret: 'taskmanager-selenium-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60
        }
    })
);


// ======================================
// RUTAS
// ======================================

app.use('/', authRoutes);

app.use('/tasks', taskRoutes);


// ======================================
// PÁGINA 404
// ======================================

app.use((req, res) => {

    res.status(404).send(
        'Página no encontrada'
    );

});


// ======================================
// INICIAR SERVIDOR
// ======================================

app.listen(PORT, () => {

    console.log('');
    console.log('==========================================');
    console.log('       TASKMANAGER INICIADO');
    console.log('==========================================');
    console.log('');
    console.log(`URL: http://localhost:${PORT}`);
    console.log('');
    console.log('Usuario: admin');
    console.log('Contraseña: 123456');
    console.log('');
    console.log('==========================================');

});