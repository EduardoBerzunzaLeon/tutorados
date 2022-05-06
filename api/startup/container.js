const { createContainer, asValue, asClass, asFunction } = require('awilix');

// * loaders
const App = require('../../loaders/framework/express.loader');
const Database = require('../../loaders/database/mongo.loader');

// * startup
const Server = require('./server');
const Startup = require('./Startup');
const config = require('../../config/environments');
const router = require('../router');

// * Helpers
const getEnviroment = require('../utils/getEnviroment');

// * Application
const { UserController, UserDTO, userRoutes } = require('../components/users');
const { SubjectController, SubjectDTO, subjectRoutes } = require('../components/subjects');
const { CourseController, CourseDTO, courseRoutes } = require('../components/courses');
const { ProfessorController, ProfessorDTO, professorRoutes } = require('../components/professors');

const { findDocs } = require('../components/factory/factory.controller');

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
  features,
} = require('../utils/');

// * Middlewares
const {
  handlerErrorNotFoundResource,
  handlerErrors,
  authMiddleware,
  uploadSingleFile,
} = require('../middlewares');

// * Services
const UserService = require('../../services/users/user.service');
const SubjectService = require('../../services/subjects/subject.service');
const CourseService = require('../../services/courses/course.service');
const ProfessorService = require('../../services/professors/professor.service');
const AuthService = require('../../services/auth/auth.service');
const FileService = require('../../services/files/file.service');

const { EmailService, EmailTemplates } = require('../../services/email');

// * Data Access Layer
const { UserRepository, UserEntity } = require('../../dal/users');
const { SubjectRepository, SubjectEntity } = require('../../dal/subjects');
const { CourseRepository, CourseEntity } = require('../../dal/courses');
const { ProfessorRepository, ProfessorEntity } = require('../../dal/professors');

const container = createContainer();

container
  // * Startup
  .register({
    App: asClass(App).singleton(),
    Database: asClass(Database).singleton(),
    Server: asClass(Server).singleton(),
    Startup: asClass(Startup).singleton(),
    config: asValue(config),
    router: asFunction(router).singleton(),
  })
  // * Utils
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
    features: asFunction(() => features).singleton(),
  })
  // * middlewares
  .register({
    handlerErrorNotFoundResource: asFunction(
      () => handlerErrorNotFoundResource
    ),
    handlerErrors: asFunction(handlerErrors),
    AuthMiddleware: asFunction(authMiddleware).singleton(),
    UploadSingleFile: asFunction(uploadSingleFile).singleton(),
  })
  .register({
    findDocs: asFunction(() => findDocs),
  })
  // * Users
  .register({
    UserController: asFunction(UserController).singleton(),
    userRoutes: asFunction(userRoutes).singleton(),
    UserDTO: asClass(UserDTO).singleton(),
    UserService: asClass(UserService).singleton(),
    UserRepository: asClass(UserRepository).singleton(),
    UserEntity: asValue(UserEntity),
  })
  // * Subjects
  .register({
    SubjectController: asFunction(SubjectController).singleton(),
    subjectRoutes: asFunction(subjectRoutes).singleton(),
    SubjectDTO: asClass(SubjectDTO).singleton(),
    SubjectService: asClass(SubjectService).singleton(),
    SubjectRepository: asClass(SubjectRepository).singleton(),
    SubjectEntity: asValue(SubjectEntity),
  })
  // * Courses
  .register({
    CourseController: asFunction(CourseController).singleton(),
    courseRoutes: asFunction(courseRoutes).singleton(),
    CourseDTO: asClass(CourseDTO).singleton(),
    CourseService: asClass(CourseService).singleton(),
    CourseRepository: asClass(CourseRepository).singleton(),
    CourseEntity: asValue(CourseEntity),
  })
  // * Professors
  .register({
    ProfessorController: asFunction(ProfessorController).singleton(),
    professorRoutes: asFunction(professorRoutes).singleton(),
    ProfessorDTO: asClass(ProfessorDTO).singleton(),
    ProfessorService: asClass(ProfessorService).singleton(),
    ProfessorRepository: asClass(ProfessorRepository).singleton(),
    ProfessorEntity: asValue(ProfessorEntity),
  })
  // * Files
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
