const logger = require('./logger');
const ApiError = require('../errors/apiError.js');

const errorHandler = (err, res) => {
    let { message } = err;
    let statusCode = err.infos?.statusCode;

    if (!statusCode || Number.isNaN(Number(statusCode))) {
        statusCode = 500;
    }

    if (statusCode === 500) {
        logger.error(err);
    }

    // Si l'application n'est pas en développement on reste vague sur l'erreur serveur
    if (statusCode === 500 && res.app.get('env') !== 'development') {
        message = 'Internal Server Error';
    }

    if (res.get('Content-type')?.includes('html')) {
        res.status(statusCode).render('error', {
            statusCode,
            message,
            title: `Error ${err.statusCode}`,
        });
    } else {
        res.status(statusCode).json({
            status: 'error',
            statusCode,
            message,
        });
    }
};

module.exports = {
    ApiError,
    errorHandler,
};
