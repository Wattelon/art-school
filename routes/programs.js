const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [programs] = await db.query('SELECT * FROM programs');
        res.status(200).type('html').render('pages/programs/list', { title: 'Программы обучения', programs });
    } catch (error) {
        console.error('Ошибка загрузки программ:', error);
        res.status(500).type('html').render('pages/error', {
            title: 'Ошибка сервера',
            code: 500,
            text: 'Произошла ошибка на стороне сервера'
        });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [[program]] = await db.query('SELECT programs.*, teachers.name as teacher from programs left join teachers on programs.teacher_id = teachers.id WHERE programs.id = ?', [id]);
        if (!program) return res.status(404).type('html').render('pages/error', {
            title: 'Страница не найдена',
            code: 404,
            text: 'Возможно, указан некорректный адрес или страница была удалена'
        });
        res.status(200).type('html').render('pages/programs/details', { title: program.title, program });
    } catch (error) {
        console.error('Ошибка загрузки деталей программы:', error);
        res.status(500).type('html').render('pages/error', {
            title: 'Ошибка сервера',
            code: 500,
            text: 'Произошла ошибка на стороне сервера'
        });
    }
});

module.exports = router;
