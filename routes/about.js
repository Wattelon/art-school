const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [teachers] = await db.query('SELECT * FROM teachers ORDER BY name');
        const [achievements] = await db.query('SELECT * FROM achievements ORDER BY date DESC');
        const [schedule] = await db.query('SELECT * FROM schedule');

        res.status(200).render('pages/about', {
            title: 'О школе',
            teachers,
            achievements,
            schedule
        });
    } catch (error) {
        console.error('Ошибка при получении данных о школе:', error);
        res.status(500).send('Ошибка сервера при загрузке страницы');
    }
});

module.exports = router;
