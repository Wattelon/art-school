const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [programs] = await db.query('SELECT * FROM programs');
        res.status(200).render('pages/programs/list', { title: 'Программы обучения', programs });
    } catch (error) {
        console.error('Ошибка загрузки программ:', error);
        res.status(500).send('Ошибка сервера');
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [[program]] = await db.query('SELECT programs.*, teachers.name as teacher from programs left join teachers on programs.teacher_id = teachers.id WHERE programs.id = ?', [id]);
        if (!program) return res.status(404).send('Программа не найдена');
        res.status(200).render('pages/programs/details', { title: program.title, program });
    } catch (error) {
        console.error('Ошибка загрузки деталей программы:', error);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
