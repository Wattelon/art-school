const express = require('express');
const db = require('../db');
const router = express.Router();

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.is_admin) return next();
    res.status(403).send('Доступ запрещён');
}

router.get('/', isAdmin, (req, res) => {
    res.render('admin/dashboard', { title: 'Админ-панель' });
});

router.get('/news', isAdmin, async (req, res) => {
    const [news] = await db.query('SELECT * FROM news ORDER BY created_at DESC');
    res.render('admin/news-list', { title: 'Админка — Новости', news });
});

router.get('/news/add', isAdmin, (req, res) => {
    res.render('admin/news-add', { title: 'Добавить новость' });
});

router.post('/news/add', isAdmin, async (req, res) => {
    const { title, content, image_url } = req.body;
    if (!title || !content || !image_url) {
        return res.send('Заполните все поля');
    }
    await db.query('INSERT INTO news (title, content, image_url) VALUES (?, ?, ?)', [title, content, image_url]);
    res.redirect('/admin/news');
});

router.get('/news/edit/:id', isAdmin, async (req, res) => {
    const [[news]] = await db.query('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (!news) return res.status(404).send('Новость не найдена');
    res.render('admin/news-edit', { title: 'Редактировать новость', news });
});

router.post('/news/edit/:id', isAdmin, async (req, res) => {
    const { title, content, image_url } = req.body;
    await db.query('UPDATE news SET title = ?, content = ?, image_url = ? WHERE id = ?', [title, content, image_url, req.params.id]);
    res.redirect('/admin/news');
});

router.post('/news/delete/:id', isAdmin, async (req, res) => {
    await db.query('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.redirect('/admin/news');
});

router.get('/applications', isAdmin, async (req, res) => {
    try {
        const [applications] = await db.execute('SELECT * FROM applications ORDER BY submitted_at DESC');
        res.render('admin/applications', { title: 'Заявки', applications });
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при получении заявок');
    }
});

router.get('/programs', isAdmin, async (req, res) => {
    const [programs] = await db.execute('SELECT * FROM programs ORDER BY id DESC');
    res.render('admin/programs/list', { title: 'Программы обучения', programs });
});

router.get('/programs/add', isAdmin, (req, res) => {
    res.render('admin/programs/add', { title: 'Программы обучения' });
});

router.post('/programs/add', isAdmin, async (req, res) => {
    const { title, description, schedule, plan, age_group } = req.body;
    if (!title) return res.status(400).send('Название обязательно');
    await db.execute(
        'INSERT INTO programs (title, description, schedule, plan, age_group) VALUES (?, ?, ?, ?, ?)',
        [title, description, schedule, plan, age_group]
    );
    res.redirect('/admin/programs');
});

router.get('/programs/edit/:id', isAdmin, async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM programs WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).send('Программа не найдена');
    res.render('admin/programs/edit', { title: 'Программы обучения', program: rows[0] });
});

router.post('/programs/edit/:id', isAdmin, async (req, res) => {
    const { title, description, schedule, plan, age_group } = req.body;
    await db.execute(
        'UPDATE programs SET title=?, description=?, schedule=?, plan=?, age_group=? WHERE id=?',
        [title, description, schedule, plan, age_group, req.params.id]
    );
    res.redirect('/admin/programs');
});

router.post('/programs/delete/:id', isAdmin, async (req, res) => {
    await db.execute('DELETE FROM programs WHERE id = ?', [req.params.id]);
    res.redirect('/admin/programs');
});

router.get('/contacts', isAdmin, async (req, res) => {
    const [contacts] = await db.execute('SELECT * FROM contacts ORDER BY id DESC');
    res.render('admin/contacts/list', { title: 'Контакты', contacts });
});

router.get('/contacts/add', isAdmin, (req, res) => {
    res.render('admin/contacts/add', { title: 'Контакты' });
});

router.post('/contacts/add', isAdmin, async (req, res) => {
    const { title, phone, email, social, address } = req.body;
    if (!title) return res.status(400).send('Поле "Название" обязательно');
    await db.execute(
        'INSERT INTO contacts (title, phone, email, social, address) VALUES (?, ?, ?, ?, ?)',
        [title, phone, email, social, address]
    );
    res.redirect('/admin/contacts');
});

router.get('/contacts/edit/:id', isAdmin, async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).send('Контакт не найден');
    res.render('admin/contacts/edit', { title: 'Контакты', contact: rows[0] });
});

router.post('/contacts/edit/:id', isAdmin, async (req, res) => {
    const { title, phone, email, social, address } = req.body;
    await db.execute(
        'UPDATE contacts SET title=?, phone=?, email=?, social=?, address=? WHERE id=?',
        [title, phone, email, social, address, req.params.id]
    );
    res.redirect('/admin/contacts');
});

router.post('/contacts/delete/:id', isAdmin, async (req, res) => {
    await db.execute('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    res.redirect('/admin/contacts');
});

router.get('/schedule', isAdmin, async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM schedule WHERE id = 1');
    const schedule = rows[0];
    res.render('admin/schedule/edit', { title: 'Расписание', schedule });
});

router.post('/schedule', isAdmin, async (req, res) => {
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;
    await db.execute(
        'UPDATE schedule SET monday=?, tuesday=?, wednesday=?, thursday=?, friday=?, saturday=?, sunday=? WHERE id=1',
        [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
    );
    res.redirect('/admin');
});

router.get('/teachers', isAdmin, async (req, res) => {
    const [teachers] = await db.execute('SELECT * FROM teachers');
    res.render('admin/teachers/list', { title: 'Педагогический состав', teachers });
});

router.get('/teachers/add', isAdmin, (req, res) => {
    res.render('admin/teachers/add', { title: 'Педагогический состав' });
});

router.post('/teachers/add', isAdmin, async (req, res) => {
    const { name, bio } = req.body;
    if (!name || !bio) {
        return res.send('Заполните все поля');
    }
    await db.execute('INSERT INTO teachers (name, bio) VALUES (?, ?)', [name, bio]);
    res.redirect('/admin/teachers');
});

router.get('/teachers/edit/:id', isAdmin, async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).send('Педагог не найден');
    res.render('admin/teachers/edit', { title: 'Педагогический состав', teacher: rows[0] });
});

router.post('/teachers/edit/:id', isAdmin, async (req, res) => {
    const { name, bio } = req.body;
    if (!name || !bio) return res.send('Заполните все поля');
    await db.execute('UPDATE teachers SET name = ?, bio = ? WHERE id = ?', [name, bio, req.params.id]);
    res.redirect('/admin/teachers');
});

router.post('/teachers/delete/:id', isAdmin, async (req, res) => {
    await db.execute('DELETE FROM teachers WHERE id = ?', [req.params.id]);
    res.redirect('/admin/teachers');
});

router.get('/achievements', isAdmin, async (req, res) => {
    const [achievements] = await db.execute('SELECT * FROM achievements ORDER BY date DESC');
    res.render('admin/achievements/list', { title: 'Достижения', achievements });
});

router.get('/achievements/add', isAdmin, (req, res) => {
    res.render('admin/achievements/add', { title: 'Достижения' });
});

router.post('/achievements/add', isAdmin, async (req, res) => {
    const { title, description, date } = req.body;
    if (!title) return res.send('Поле "Заголовок" обязательно');
    await db.execute(
        'INSERT INTO achievements (title, description, date) VALUES (?, ?, ?)',
        [title, description || null, date || null]
    );
    res.redirect('/admin/achievements');
});

router.get('/achievements/edit/:id', isAdmin, async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM achievements WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).send('Достижение не найдено');
    res.render('admin/achievements/edit', { title: 'Достижения', achievement: rows[0] });
});

router.post('/achievements/edit/:id', isAdmin, async (req, res) => {
    const { title, description, date } = req.body;
    if (!title) return res.send('Поле "Заголовок" обязательно');
    await db.execute(
        'UPDATE achievements SET title = ?, description = ?, date = ? WHERE id = ?',
        [title, description || null, date || null, req.params.id]
    );
    res.redirect('/admin/achievements');
});

router.post('/achievements/delete/:id', isAdmin, async (req, res) => {
    await db.execute('DELETE FROM achievements WHERE id = ?', [req.params.id]);
    res.redirect('/admin/achievements');
});


module.exports = router;
