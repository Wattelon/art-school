const express = require('express');
const path = require('path');
const session = require('express-session');
const url = require('url');
const logChangeMiddleware = require('./middleware/logger');

const indexRouter = require('./routes/index');
const newsRouter = require('./routes/news');
const reactionsRouter = require('./routes/reactions');
const aboutRouter = require('./routes/about');
const contactsRouter = require('./routes/contacts');
const programsRouter = require('./routes/programs');
const authRouter = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const applicationRouter = require('./routes/application');

const app = express();

app.use(session({
    secret: 'artist', // Лучше вынести в .env
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 дней
        httpOnly: true,
        sameSite: 'lax'
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logChangeMiddleware);

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

app.locals.partials = path.join(__dirname, 'views/partials');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use((req, res, next) => {
    const parsedUrl = url.parse(req.url, true);
    console.log(`[${new Date().toISOString()}] ${req.method} ${parsedUrl.pathname}`);
    next();
});

app.use('/', indexRouter);
app.use('/news', newsRouter);
app.use('/reactions', reactionsRouter);
app.use('/about', aboutRouter);
app.use('/contacts', contactsRouter);
app.use('/programs', programsRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRoutes);
app.use('/application', applicationRouter);

app.use((req, res) => {
    res.status(404).type('text/html').send('<h1>Страница не найдена (404)</h1><a href="/">На главную</a>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
