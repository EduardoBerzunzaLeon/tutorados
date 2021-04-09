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
// Users
const { UserController, UserDTO, userRoutes } = require('../components/users');

// Errors
const { ErrorController, ErrorDTO } = require('../components/errors/');
const AppError = require('../utils/appError');

// Utils
const catchAsync = require('../utils/catchAsync');

// Middlewares
const {
  handlerErrorNotFoundResource,
  handlerErrors,
} = require('../middlewares');

// Services
const UserService = require('../../services/users/user.service');

// Data Access Layer
const { UserRepository, UserEntity } = require('../../dal/users');

// const container = createContainer({ injectionMode: InjectionMode.CLASSIC });
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
    // Handler Error
    createAppError: asFunction(() => (message, statusCode) =>
      new AppError(message, statusCode)
    ).singleton(),
    handlerErrorNotFoundResource: asFunction(
      () => handlerErrorNotFoundResource
    ),
    handlerErrors: asFunction(handlerErrors),
    // Utils
    catchAsync: asFunction(() => catchAsync).singleton(),
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
  });

module.exports = container;
