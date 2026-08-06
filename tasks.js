const express = require('express');

const router = express.Router();


// ======================================
// ALMACENAMIENTO DE TAREAS
// ======================================

let tasks = [];

let nextId = 1;


// ======================================
// VERIFICAR LOGIN
// ======================================

function requireLogin(req, res, next) {

    if (!req.session.user) {

        return res.redirect('/login');

    }

    next();

}


router.use(requireLogin);


// ======================================
// LISTAR TAREAS
// ======================================

router.get('/', (req, res) => {

    res.render(
        'tasks/index',
        {

            tasks,

            user: req.session.user

        }
    );

});


// ======================================
// MOSTRAR CREAR
// ======================================

router.get('/create', (req, res) => {

    res.render(
        'tasks/create',
        {

            error: null,

            data: {}

        }
    );

});


// ======================================
// CREAR TAREA
// ======================================

router.post('/create', (req, res) => {

    const title =
        req.body.title
            ? req.body.title.trim()
            : '';

    const description =
        req.body.description
            ? req.body.description.trim()
            : '';

    const due_date =
        req.body.due_date || '';

    const priority =
        req.body.priority || '';

    const status =
        req.body.status || '';


    const data = {

        title,

        description,

        due_date,

        priority,

        status

    };


    // CAMPOS OBLIGATORIOS

    if (
        !title ||
        !description ||
        !due_date ||
        !priority ||
        !status
    ) {

        return res.render(
            'tasks/create',
            {

                error:
                    'Todos los campos son obligatorios.',

                data

            }
        );

    }


    // LÍMITE MÍNIMO

    if (title.length < 3) {

        return res.render(
            'tasks/create',
            {

                error:
                    'El título debe tener mínimo 3 caracteres.',

                data

            }
        );

    }


    // LÍMITE MÁXIMO

    if (title.length > 100) {

        return res.render(
            'tasks/create',
            {

                error:
                    'El título no puede superar los 100 caracteres.',

                data

            }
        );

    }


    // DESCRIPCIÓN

    if (description.length > 500) {

        return res.render(
            'tasks/create',
            {

                error:
                    'La descripción no puede superar los 500 caracteres.',

                data

            }
        );

    }


    // GUARDAR

    const newTask = {

        id: nextId++,

        title,

        description,

        due_date,

        priority,

        status

    };


    tasks.push(newTask);


    res.redirect('/tasks');

});


// ======================================
// MOSTRAR EDITAR
// ======================================

router.get('/edit/:id', (req, res) => {

    const id =
        Number(req.params.id);


    const task =
        tasks.find(
            task => task.id === id
        );


    if (!task) {

        return res
            .status(404)
            .send('Tarea no encontrada.');

    }


    res.render(
        'tasks/edit',
        {

            task,

            error: null

        }
    );

});


// ======================================
// ACTUALIZAR TAREA
// ======================================

router.post('/edit/:id', (req, res) => {

    const id =
        Number(req.params.id);


    const index =
        tasks.findIndex(
            task => task.id === id
        );


    if (index === -1) {

        return res
            .status(404)
            .send('Tarea no encontrada.');

    }


    const title =
        req.body.title
            ? req.body.title.trim()
            : '';

    const description =
        req.body.description
            ? req.body.description.trim()
            : '';

    const due_date =
        req.body.due_date || '';

    const priority =
        req.body.priority || '';

    const status =
        req.body.status || '';


    const task = {

        id,

        title,

        description,

        due_date,

        priority,

        status

    };


    // CAMPOS VACÍOS

    if (
        !title ||
        !description ||
        !due_date ||
        !priority ||
        !status
    ) {

        return res.render(
            'tasks/edit',
            {

                task,

                error:
                    'Todos los campos son obligatorios.'

            }
        );

    }


    // VALIDAR TÍTULO

    if (
        title.length < 3 ||
        title.length > 100
    ) {

        return res.render(
            'tasks/edit',
            {

                task,

                error:
                    'El título debe contener entre 3 y 100 caracteres.'

            }
        );

    }


    // VALIDAR DESCRIPCIÓN

    if (description.length > 500) {

        return res.render(
            'tasks/edit',
            {

                task,

                error:
                    'La descripción no puede superar los 500 caracteres.'

            }
        );

    }


    // ACTUALIZAR

    tasks[index] = task;


    res.redirect('/tasks');

});


// ======================================
// ELIMINAR TAREA
// ======================================

router.post('/delete/:id', (req, res) => {

    const id =
        Number(req.params.id);


    tasks =
        tasks.filter(
            task => task.id !== id
        );


    res.redirect('/tasks');

});


module.exports = router;