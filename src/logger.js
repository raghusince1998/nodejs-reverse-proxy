const fs = require('fs');
const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');

function createLogger(logFilePath) {
    const logDir = path.dirname(logFilePath);

    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    return winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(info =>
                `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
            )
        ),
        transports: [
            new winston.transports.DailyRotateFile({
                filename: logFilePath.replace(/\.log$/, '') + '-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d',
                zippedArchive: true
            })
        ]
    });
}

module.exports = {
    createLogger
};
