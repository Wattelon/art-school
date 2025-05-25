exports.requireLogin = (req, res, next) => {
    if (!req.session.user) return res.redirect('/auth');
    next();
};

exports.requireAdmin = (req, res, next) => {
    if (!req.session.user?.is_admin) return res.status(403).send('Доступ запрещён');
    next();
};
