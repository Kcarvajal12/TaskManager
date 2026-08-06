const express = require('express');

const router = express.Router();


// ======================================
// USUARIO DE PRUEBA
// ======================================

const USER = {

    id: 1,

    username: 'admin',

    password: '123456'

};


// ======================================
// PÁGINA PRINCIPAL
// ======================================

router.get('/', (req, res) => {

    if (req.session.user) {

        return res.redirect('/tasks');

    }

    return res.redirect('/login');

});


// ======================================
// MOSTRAR LOGIN
// ======================================

router.get('/login', (req, res) => {

    if (req.session.user) {

        return res.redirect('/tasks');

    }

    res.render(
        'login',
        {
            error: null
        }
    );

});


// ======================================
// PROCESAR LOGIN
// ======================================

router.post('/login', (req, res) => {

    const username =
        req.body.username
            ? req.body.username.trim()
            : '';

    const password =
        req.body.password
            ? req.body.password.trim()
            : '';


    // CAMPOS VACÍOS

    if (!username || !password) {

        return res.render(
            'login',
            {
                error:
                    'Debe completar usuario y contraseña.'
            }
        );

    }


    // CREDENCIALES INCORRECTAS

    if (
        username !== USER.username ||
        password !== USER.password
    ) {

        return res.render(
            'login',
            {
                error:
                    'Usuario o contraseña incorrectos.'
            }
        );

    }


    // LOGIN CORRECTO

    req.session.user = {

        id: USER.id,

        username: USER.username

    };


    return res.redirect('/tasks');

});


// ======================================
// CERRAR SESIÓN
// ======================================

router.get('/logout', (req, res) => {

    req.session.destroy(() => {

        res.redirect('/login');

    });

});


module.exports = router;