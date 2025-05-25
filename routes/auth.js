const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db');

router.get('/login', (req, res) => {
    res.render('pages/auth/login', { title: 'Вход', error: null });
});

router.get('/register', (req, res) => {
    res.render('pages/auth/register', { title: 'Регистрация', error: null });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [[user]] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) return res.render('pages/auth/login', { error: 'Неверный email или пароль', title: 'Вход' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.render('pages/auth/login', { error: 'Неверный email или пароль', title: 'Вход' });

        req.session.user = { id: user.id, email: user.email, username: user.username, is_admin: user.is_admin };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

router.post('/register', async (req, res) => {
    const { email, password, password_confirm } = req.body;
    if (!email || !password || password !== password_confirm) {
        return res.render('pages/auth/register', { error: 'Проверьте корректность данных', title: 'Регистрация' });
    }

    try {
        const [[existing]] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) return res.render('pages/auth/register', { error: 'Пользователь с таким email уже существует', title: 'Регистрация' });

        const password_hash = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, password_hash]);

        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
