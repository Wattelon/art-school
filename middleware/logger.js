const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '../db.log');

function logChangeMiddleware(req, res, next) {
    const methodsToLog = ['POST', 'PUT', 'DELETE'];

    if (methodsToLog.includes(req.method)) {
        const timestamp = new Date().toISOString();
        let bodyData = '';

        try {
            bodyData = JSON.stringify(req.body);
        } catch (e) {
            bodyData = '[Could not stringify body]';
        }

        const logMessage = `[${timestamp}] ${req.method} ${req.originalUrl} - ${bodyData}\n`;

        fs.appendFile(logPath, logMessage, (err) => {
            if (err) console.error('Ошибка при записи в лог:', err);
        });
    }

    next();
}

module.exports = logChangeMiddleware;
