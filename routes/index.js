const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [news] = await db.query('SELECT id, title, image_url FROM news ORDER BY created_at DESC LIMIT 3');
        res.status(200).render('pages/index', {
            title: 'Школа Искусств',
            news
        });
    } catch (error) {
        console.error('Ошибка при получении новостей:', error);
        res.status(500).send('Внутренняя ошибка сервера');
    }
});

module.exports = router;
