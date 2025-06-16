const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require("moment");

router.get('/', async (req, res) => {
    try {
        const [teachers] = await db.query('SELECT * FROM teachers ORDER BY id');
        const [schedule] = await db.query({sql: 'SELECT * FROM schedule', rowsAsArray: true});
        const [achievements] = await db.query('SELECT * FROM achievements ORDER BY date DESC');

        const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]

        const weekSchedule = days.map((day, index) => ({dayOfWeek: day, workingHours: schedule[0][index + 1]}));

        achievements.forEach(achievement => {
            achievement.date = moment(achievement.date).format('DD.MM.YYYY');
        })

        res.status(200).type('html').render('pages/about', {
            title: 'О школе',
            teachers,
            achievements,
            weekSchedule
        });
    } catch (error) {
        console.error('Ошибка при получении данных о школе:', error);
        res.status(500).send('Ошибка сервера при загрузке страницы');
    }
});

module.exports = router;
