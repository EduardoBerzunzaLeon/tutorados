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
const { authController } = require('../components/auth');
const { ErrorController, ErrorDTO } = require('../components/errors/');
const { FileController, fileRoutes } = require('../components/files');

const {
  catchAsync,
  AppError,
  generateHashedToken,
  generateRandomString,
  googleVerify,
  facebookVerify,
} = require('../utils/');

// Middlewares
const {
  handlerErrorNotFoundResource,
  handlerErrors,
  authMiddleware,
  uploadSingleFile,
} = require('../middlewares');

// Services
const UserService = require('../../services/users/user.service');
const AuthService = require('../../services/auth/auth.service');
const FileService = require('../../services/files/file.service');

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
  // Utils
  .register({
    createAppError: asFunction(
      () => (message, statusCode) => new AppError(message, statusCode)
    ).singleton(),
    catchAsync: asFunction(() => catchAsync).singleton(),
    getEnviroment: asFunction(getEnviroment).singleton(),
    generateHashedToken: asFunction(() => generateHashedToken).singleton(),
    generateRandomString: asFunction(() => generateRandomString).singleton(),
    googleVerify: asFunction(googleVerify).singleton(),
    facebookVerify: asFunction(facebookVerify).singleton(),
  })
  // middlewares
  .register({
    handlerErrorNotFoundResource: asFunction(
      () => handlerErrorNotFoundResource
    ),
    handlerErrors: asFunction(handlerErrors),
    AuthMiddleware: asFunction(authMiddleware).singleton(),
    UploadSingleFile: asFunction(uploadSingleFile).singleton(),
  })
  // Users
  .register({
    UserController: asFunction(UserController).singleton(),
    userRoutes: asFunction(userRoutes).singleton(),
    UserDTO: asClass(UserDTO).singleton(),
    UserService: asClass(UserService).singleton(),
    UserRepository: asClass(UserRepository).singleton(),
    UserEntity: asValue(UserEntity),
  })
  // Files
  .register({
    FileController: asFunction(FileController).singleton(),
    fileRoutes: asFunction(fileRoutes).singleton(),
    FileService: asClass(FileService).singleton(),
  })
  .register({
    ErrorController: asClass(ErrorController).singleton(),
    ErrorDTO: asClass(ErrorDTO).singleton(),
  })
  .register({
    AuthController: asFunction(authController).singleton(),
    AuthService: asClass(AuthService).singleton(),
  })
  .register({
    EmailService: asClass(EmailService),
    EmailTemplates: asClass(EmailTemplates),
  });

module.exports = container;
