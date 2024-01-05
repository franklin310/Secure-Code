const Logger = require('../services/logger-service');

module.exports = (err, req, res, next) => {

  Logger.error(err);

  if (err.name === 'UnauthorizedError') {
    return res.status(401).redirect('/auth');
  }

  const status = err.status || 500;
  const message = err.message || 'Server Error';

  res.status(status).render('error-view.pug', {
    title: ${status} ${message},
    status,
    message,
  });
};