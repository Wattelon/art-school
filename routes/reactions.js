const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/:newsId', async (req, res) => {
    const { newsId } = req.params;
    const { type } = req.body;
    const userId = req.session?.user?.id;

    if (!userId) return res.status(401).send('Требуется авторизация');
    if (!['like', 'dislike'].includes(type)) return res.status(400).send('Некорректный тип реакции');

    try {
        await db.query(`
      INSERT INTO reactions (user_id, news_id, type)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE type = VALUES(type)
    `, [userId, newsId, type]);

        res.redirect(`/news/${newsId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сохранения реакции');
    }
});

module.exports = router;
