const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/:newsId', async (req, res) => {
    const { newsId } = req.params;
    const { type } = req.body;
    const userId = req.session?.user?.id;

    if (!userId) return res.status(401).type('html').render('pages/error', {
        title: 'Требуется авторизация',
        code: 401,
        text: 'Для выполнения запроса необходимо войти в аккаунт'
    });
    if (!['like', 'dislike'].includes(type)) return res.status(401).type('html').render('pages/error', {
        title: 'Ошибка запроса',
        code: 400,
        text: 'Некорректный запрос'
    });

    try {
        await db.query(`
      INSERT INTO reactions (user_id, news_id, type)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE type = VALUES(type)
    `, [userId, newsId, type]);

        res.redirect(`/news/${newsId}`);
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
