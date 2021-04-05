const { createContainer, asValue, asClass, asFunction } = require('awilix');

// laoders
const App = require('../../loaders/framework/express.loader');
const Database = require('../../loaders/database/mongo.loader');

// startup
const Server = require('./server');
const Startup = require('./Startup');
const config = require('../../config/environments');
const router = require('../router');

// Helpers
const getEnviroment = require('../../helpers/getEnviroment');

// Application
// Users
const { UserController, UserDTO, userRoutes } = require('../components/users');

// Errors
const { ErrorController, ErrorDTO } = require('../components/errors/');

// Middlewares
const {
  handlerErrorNotFoundResource,
  handlerErrors,
} = require('../middlewares');

// Services
const UserService = require('../../services/users/user.service');

// Data Access Layer
const { UserRepository, UserEntity } = require('../../dal/users');
const AppError = require('../utils/appError');

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
  // Error Handler
  .register({
    createAppError: asFunction(() => (message, statusCode) =>
      new AppError(message, statusCode)
    ).singleton(),
    handlerErrorNotFoundResource: asFunction(handlerErrorNotFoundResource),
    handlerErrors: asFunction(handlerErrors),
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
