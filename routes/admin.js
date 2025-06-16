const express = require('express');
const db = require('../db');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/', (req, res) => {
    res.status(200).type('html').render('pages/admin/index', { title: 'Админ-панель' });
});

router.get('/news', async (req, res) => {
    const [news] = await db.query('SELECT * FROM news ORDER BY created_at DESC');
    res.status(200).type('html').render('pages/admin/news', { title: 'Админ-панель — Новости', news });
});

router.post('/news/add', async (req, res) => {
    const { title, content, image_url } = req.body;
    if (!title || !content || !image_url) {
        return res.status(400).json({ message: 'Все поля обязательны' });
    }
    await db.query('INSERT INTO news (title, content, image_url) VALUES (?, ?, ?)', [title, content, image_url]);
    res.json({ message: 'Новость успешно добавлена' });
});

router.post('/news/edit/:id', async (req, res) => {
    const { title, content, image_url } = req.body;
    const id = req.params.id;
    await db.query('UPDATE news SET title = ?, content = ?, image_url = ? WHERE id = ?', [title, content, image_url, id]);
    res.json({ message: 'Новость успешно обновлена' });
});

router.post('/news/delete', async (req, res) => {
    const ids = req.body.delete_ids;
    if (!ids || ids.length === 0) {
        return res.status(400).json({ message: 'Нет выбранных новостей' });
    }

    const placeholders = ids.map(() => '?').join(',');
    await db.query(`DELETE FROM news WHERE id IN (${placeholders})`, ids);

    res.json({ message: 'Новости удалены' });
});

router.get('/news/:id', async (req, res) => {
    const [[news]] = await db.query('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (!news) return res.status(404).type('html').render('pages/error', {
        title: 'Страница не найдена',
        code: 404,
        text: 'Возможно, указан некорректный адрес или страница была удалена'
    });
    res.json(news);
});

router.get('/applications', async (req, res) => {
    try {
        const [applications] = await db.execute('SELECT * FROM applications ORDER BY submitted_at DESC');
        res.status(200).type('html').render('pages/admin/applications', { title: 'Заявки', applications });
    } catch (err) {
        console.error(err);
        res.status(500).type('html').render('pages/error', {
            title: 'Ошибка сервера',
            code: 500,
            text: 'Произошла ошибка на стороне сервера'
        });
    }
});

router.get('/programs', async (req, res) => {
    const [programs] = await db.execute('SELECT * FROM programs ORDER BY id DESC');
    res.status(200).type('html').render('pages/admin/programs/list', { title: 'Программы обучения', programs });
});

router.get('/programs/add', async (req, res) => {
    const [teachers] = await db.query('SELECT id, name FROM teachers');
    res.status(200).type('html').render('pages/admin/programs/add', { title: 'Программы обучения', teachers });
});

router.post('/programs/add', async (req, res) => {
    const { title, description, schedule, plan, age_group, teacher_id } = req.body;
    if (!title) return res.status(400).send('Название обязательно');
    await db.execute(
        'INSERT INTO programs (title, description, schedule, plan, age_group, teacher_id) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, schedule, plan, age_group, teacher_id]
    );
    res.status(301).type('html').redirect('/admin/programs');
});

router.get('/programs/edit/:id', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM programs WHERE id = ?', [req.params.id]);
    const [teachers] = await db.query('SELECT id, name FROM teachers');
    if (!rows.length) return res.status(404).type('html').render('pages/error', {
        title: 'Страница не найдена',
        code: 404,
        text: 'Возможно, указан некорректный адрес или страница была удалена'
    });
    res.status(200).type('html').render('pages/admin/programs/edit', { title: 'Программы обучения', program: rows[0], teachers });
});

router.post('/programs/edit/:id', async (req, res) => {
    const { title, description, schedule, plan, age_group, teacher_id } = req.body;
    const teacher = teacher_id ? teacher_id : null;
    await db.execute(
        'UPDATE programs SET title=?, description=?, schedule=?, plan=?, age_group=?, teacher_id=? WHERE id=?',
        [title, description, schedule, plan, age_group, teacher, req.params.id]
    );
    res.status(301).type('html').redirect('/admin/programs');
});

router.post('/programs/delete/:id', async (req, res) => {
    await db.execute('DELETE FROM programs WHERE id = ?', [req.params.id]);
    res.status(301).type('html').redirect('/admin/programs');
});

router.get('/contacts', async (req, res) => {
    const [contacts] = await db.execute('SELECT * FROM contacts ORDER BY id DESC');
    res.status(200).type('html').render('pages/admin/contacts/list', { title: 'Контакты', contacts });
});

router.get('/contacts/add', (req, res) => {
    res.status(200).type('html').render('pages/admin/contacts/add', { title: 'Контакты' });
});

router.post('/contacts/add', async (req, res) => {
    const { title, phone, email, social, address } = req.body;
    if (!title) return res.status(400).send('Поле "Название" обязательно');
    await db.execute(
        'INSERT INTO contacts (title, phone, email, social, address) VALUES (?, ?, ?, ?, ?)',
        [title, phone, email, social, address]
    );
    res.status(301).type('html').redirect('/admin/contacts');
});

router.get('/contacts/edit/:id', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).type('html').render('pages/error', {
        title: 'Страница не найдена',
        code: 404,
        text: 'Возможно, указан некорректный адрес или страница была удалена'
    });
    res.status(200).type('html').render('pages/admin/contacts/edit', { title: 'Контакты', contact: rows[0] });
});

router.post('/contacts/edit/:id', async (req, res) => {
    const { title, phone, email, social, address } = req.body;
    await db.execute(
        'UPDATE contacts SET title=?, phone=?, email=?, social=?, address=? WHERE id=?',
        [title, phone, email, social, address, req.params.id]
    );
    res.status(301).type('html').redirect('/admin/contacts');
});

router.post('/contacts/delete/:id', async (req, res) => {
    await db.execute('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    res.status(301).type('html').redirect('/admin/contacts');
});

router.get('/schedule', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM schedule WHERE id = 1');
    const schedule = rows[0];
    res.status(200).type('html').render('pages/admin/schedule', { title: 'Расписание', schedule });
});

router.post('/schedule', async (req, res) => {
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;
    await db.execute(
        'UPDATE schedule SET monday=?, tuesday=?, wednesday=?, thursday=?, friday=?, saturday=?, sunday=? WHERE id=1',
        [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
    );
    res.status(301).type('html').redirect('/admin');
});

router.get('/teachers', async (req, res) => {
    const [teachers] = await db.execute('SELECT * FROM teachers');
    res.status(200).type('html').render('pages/admin/teachers/list', { title: 'Педагогический состав', teachers });
});

router.get('/teachers/add', (req, res) => {
    res.status(200).type('html').render('pages/admin/teachers/add', { title: 'Педагогический состав' });
});

router.post('/teachers/add', async (req, res) => {
    const { name, bio, image_url } = req.body;
    if (!name) {
        return res.send('Заполните все поля');
    }
    await db.execute('INSERT INTO teachers (name, bio, image_url) VALUES (?, ?, ?)', [name, bio, image_url]);
    res.status(301).type('html').redirect('/admin/teachers');
});

router.get('/teachers/edit/:id', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).type('html').render('pages/error', {
        title: 'Страница не найдена',
        code: 404,
        text: 'Возможно, указан некорректный адрес или страница была удалена'
    });
    res.status(200).type('html').render('pages/admin/teachers/edit', { title: 'Педагогический состав', teacher: rows[0] });
});

router.post('/teachers/edit/:id', async (req, res) => {
    const { name, bio, image_url } = req.body;
    if (!name) return res.send('Заполните все поля');
    await db.execute('UPDATE teachers SET name = ?, bio = ?, image_url = ? WHERE id = ?', [name, bio, image_url, req.params.id]);
    res.status(301).type('html').redirect('/admin/teachers');
});

router.post('/teachers/delete/:id', async (req, res) => {
    await db.execute('DELETE FROM teachers WHERE id = ?', [req.params.id]);
    res.status(301).type('html').redirect('/admin/teachers');
});

router.get('/achievements', async (req, res) => {
    const [achievements] = await db.execute('SELECT * FROM achievements ORDER BY date DESC');
    res.status(200).type('html').render('pages/admin/achievements/list', { title: 'Достижения', achievements });
});

router.get('/achievements/add', (req, res) => {
    res.status(200).type('html').render('pages/admin/achievements/add', { title: 'Достижения' });
});

router.post('/achievements/add', async (req, res) => {
    const { title, description, date } = req.body;
    if (!title) return res.send('Поле "Заголовок" обязательно');
    await db.execute(
        'INSERT INTO achievements (title, description, date) VALUES (?, ?, ?)',
        [title, description || null, date || null]
    );
    res.status(301).type('html').redirect('/admin/achievements');
});

router.get('/achievements/edit/:id', async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM achievements WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).type('html').render('pages/error', {
        title: 'Страница не найдена',
        code: 404,
        text: 'Возможно, указан некорректный адрес или страница была удалена'
    });
    res.status(200).type('html').render('pages/admin/achievements/edit', { title: 'Достижения', achievement: rows[0] });
});

router.post('/achievements/edit/:id', async (req, res) => {
    const { title, description, date } = req.body;
    if (!title) return res.send('Поле "Заголовок" обязательно');
    await db.execute(
        'UPDATE achievements SET title = ?, description = ?, date = ? WHERE id = ?',
        [title, description || null, date || null, req.params.id]
    );
    res.status(301).type('html').redirect('/admin/achievements');
});

router.post('/achievements/delete/:id', async (req, res) => {
    await db.execute('DELETE FROM achievements WHERE id = ?', [req.params.id]);
    res.status(301).type('html').redirect('/admin/achievements');
});

module.exports = router;
