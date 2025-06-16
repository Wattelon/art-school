const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require("moment");

router.get('/', async (req, res) => {
    try {
        const [news] = await db.query('SELECT * FROM news ORDER BY created_at DESC LIMIT 3');
        news.forEach(row => {
            row.time = moment(row.created_at).format('DD.MM.YYYY');
        });
        res.status(200).type('html').render('pages/index', {
            title: 'Школа Искусств',
            news
        });
    } catch (error) {
        console.error('Ошибка при получении новостей:', error);
        res.status(500).type('html').render('pages/error', {
            title: 'Ошибка сервера',
            code: 500,
            text: 'Произошла ошибка на стороне сервера'
        });
    }
});

module.exports = router;
