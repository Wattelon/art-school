const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [contacts] = await db.query('SELECT * FROM contacts');
        res.status(200).type('html').render('pages/contacts', {
            title: 'Контакты',
            contacts
        });
    } catch (err) {
        console.error('Ошибка при получении контактов:', err);
        res.status(500).type('html').render('pages/error', {
            title: 'Ошибка сервера',
            code: 500,
            text: 'Произошла ошибка на стороне сервера'
        });
    }
});

module.exports = router;
