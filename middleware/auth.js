exports.requireLogin = (req, res, next) => {
    if (!req.session.user) return res.redirect('/auth');
    next();
};

exports.requireAdmin = (req, res, next) => {
    if (!req.session.user?.is_admin) return res.status(403).render('pages/error', {
        title: 'Отказано в доступе',
        code: 403,
        text: 'Доступ на эту страницу запрещён'
    });
    next();
};
