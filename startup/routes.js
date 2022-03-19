const express = require('express');
const topicRouter = require('../routes/topicRoute');
const AppError = require('../utils/appError');
const globalErrorHandler = require('../controllers/errorController');

module.exports = function (app) {
  app.set('trust proxy', 'loopback'); // for deployment to get the host in the code
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(
    express.json({
      verify: (req, res, buf) => {
        req.rawBody = buf;
      },
      limit: '50mb'
    })
  );
  app.use('/search', topicRouter);

  /* istanbul ignore next */
  // if any link is visited and not mentioned above will go to that next middleware
  app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });
  app.use(globalErrorHandler);
};
