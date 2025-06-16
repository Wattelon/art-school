const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require("moment/moment");

router.get('/', async (req, res) => {
    try {
        const [news] = await db.query(
            'SELECT * FROM news ORDER BY created_at DESC'
        );
        news.forEach(row => {
            row.time = moment(row.created_at).format('DD.MM.YYYY');
        });
        res.status(200).type('html').render('pages/news/list', { title: 'Новости', news });
    } catch (error) {
        console.error(error);
        res.status(500).type('html').render('pages/error', {
            title: 'Ошибка сервера',
            code: 500,
            text: 'Произошла ошибка на стороне сервера'
        });
    }
});

router.get('/:id', async (req, res) => {
    const newsId = req.params.id;
    const userId = req.session?.user?.id || null;

    try {
        const [[news]] = await db.query(
            'SELECT n.*, \n' +
            '        (SELECT COUNT(*) FROM reactions r WHERE r.news_id = n.id AND r.type = \'like\') AS likes,\n' +
            '        (SELECT COUNT(*) FROM reactions r WHERE r.news_id = n.id AND r.type = \'dislike\') AS dislikes\n' +
            '      FROM news n\n' +
            '      WHERE n.id = ?',
            [newsId]
        );

        if (!news) return res.status(404).type('html').render('pages/error', {
            title: 'Страница не найдена',
            code: 404,
            text: 'Возможно, указан некорректный адрес или страница была удалена'
        });

        let reaction = null;

        if (userId) {
            const [[react]] = await db.query(
                'SELECT type FROM reactions WHERE user_id = ? AND news_id = ?',
                [userId, newsId]
            );
            reaction = react?.type || null;
        }

        res.status(200).type('html').render('pages/news/details', {
            title: news.title,
            news,
            reaction,
            likes: news.likes,
            dislikes: news.dislikes,
            user: req.session?.user || null
        });
    } catch (error) {
        console.error(error);
        res.status(500).type('html').render('pages/error', {
            title: 'Ошибка сервера',
            code: 500,
            text: 'Произошла ошибка на стороне сервера'
        });
    }
});

module.exports = router;
