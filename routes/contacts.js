const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [contacts] = await db.query('SELECT * FROM contacts');
        res.status(200).render('pages/contacts', {
            title: 'Контакты',
            contacts
        });
    } catch (err) {
        console.error('Ошибка при получении контактов:', err);
        res.status(500).send('Ошибка сервера при загрузке контактов');
    }
});

module.exports = router;
