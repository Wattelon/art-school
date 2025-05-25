const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    res.render('pages/application/form', { title: 'Заявка', error: null });
});

router.get('/response', (req, res) => {
    res.render('pages/application/response', { title: 'Заявка', error: null });
});


router.post('/', async (req, res) => {
    const { name, age, phone, email } = req.body;

    if (!name || !age || (!phone && !email)) {
        return res.status(400).render('pages/application/form', { title: 'Заявка', error: 'Заполните обязательные поля: ФИО, возраст и хотя бы один контакт (телефон или email).' });
    }

    try {
        await db.execute(
            'INSERT INTO applications (name, age, phone, email) VALUES (?, ?, ?, ?)',
            [name, age, phone || null, email || null]
        );
        res.redirect('/application/response');
    } catch (err) {
        console.error(err);
        res.status(500).render('pages/application/form', { title: 'Заявка', error: 'Ошибка при отправке заявки. Попробуйте позже.' });
    }
});

module.exports = router;
