const path = require('path');

const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

// const AppError = require('../../api/utils/appError');
// const hpp = require('hpp'); TODO: Implements Prevent parameter pollution

class App {
  constructor({
    router,
    handlerErrorNotFoundResource,
    handlerErrors,
    getEnviroment,
  }) {
    this.app = express();
    this.router = router;
    this.handlerErrorNotFoundResource = handlerErrorNotFoundResource;
    this.handlerErrors = handlerErrors;
    this.enviroment = getEnviroment;

    this.limiter = rateLimit({
      max: 250,
      windowMs: 60 * 60 * 1000,
      message: 'Too many requests from this IP, please try again in an hour!',
    });

    this.middlewares();

    // Error Handlers
    this.errorHandlers();
  }
  
  middlewares() {
    // Basic Settings
    
    this.app.use(
      logger('dev', { skip: (req, res) => this.enviroment === 'test' })
      );
    
    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));
    this.app.use(cookieParser());

    // Security
    this.app.use(xss());
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(mongoSanitize());
    this.app.use('/api', this.limiter);

    // Performance
    this.app.use(compression());

    // routes
    this.app.use(this.router);
  }

  errorHandlers() {
    // Error 404 Not Found
    this.app.all('*', this.handlerErrorNotFoundResource);
    // Generic Errors
    this.app.use(this.handlerErrors);
  }
}

module.exports = App;
