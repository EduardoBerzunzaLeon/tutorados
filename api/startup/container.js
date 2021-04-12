const { createContainer, asValue, asClass, asFunction } = require('awilix');

// loaders
const App = require('../../loaders/framework/express.loader');
const Database = require('../../loaders/database/mongo.loader');

// startup
const Server = require('./server');
const Startup = require('./Startup');
const config = require('../../config/environments');
const router = require('../router');

// Helpers
const getEnviroment = require('../utils/getEnviroment');

// Application
const { UserController, UserDTO, userRoutes } = require('../components/users');
const { AuthController } = require('../components/auth');
const { ErrorController, ErrorDTO } = require('../components/errors/');

// Utils
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Middlewares
const {
  handlerErrorNotFoundResource,
  handlerErrors,
  authMiddleware,
} = require('../middlewares');

// Services
const UserService = require('../../services/users/user.service');
const AuthService = require('../../services/auth/auth.service');
const { EmailService, EmailTemplates } = require('../../services/email');

// Data Access Layer
const { UserRepository, UserEntity } = require('../../dal/users');

const container = createContainer();

container
  // Startup
  .register({
    App: asClass(App).singleton(),
    Database: asClass(Database).singleton(),
    Server: asClass(Server).singleton(),
    Startup: asClass(Startup).singleton(),
    config: asValue(config),
    router: asFunction(router).singleton(),
  })
  // Helpers
  .register({
    getEnviroment: asFunction(getEnviroment).singleton(),
  })
  // Utils
  .register({
    createAppError: asFunction(() => (message, statusCode) =>
      new AppError(message, statusCode)
    ).singleton(),
    catchAsync: asFunction(() => catchAsync).singleton(),
  })
  // middlewares
  .register({
    handlerErrorNotFoundResource: asFunction(
      () => handlerErrorNotFoundResource
    ),
    handlerErrors: asFunction(handlerErrors),
    AuthMiddleware: asClass(authMiddleware).singleton(),
  })
  // Users
  .register({
    UserController: asClass(UserController.bind(UserController)).singleton(),
    userRoutes: asFunction(userRoutes).singleton(),
    UserDTO: asClass(UserDTO).singleton(),
    UserService: asClass(UserService).singleton(),
    UserRepository: asClass(UserRepository).singleton(),
    UserEntity: asValue(UserEntity),
  })
  .register({
    ErrorController: asClass(ErrorController).singleton(),
    ErrorDTO: asClass(ErrorDTO).singleton(),
  })
  .register({
    AuthController: asClass(AuthController.bind(AuthController)).singleton(),
    AuthService: asClass(AuthService).singleton(),
  })
  .register({
    EmailService: asClass(EmailService),
    EmailTemplates: asClass(EmailTemplates),
  });

module.exports = container;
