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
const { CourseController, CourseDTO, courseMiddleware, courseRoutes } = require('../components/courses');
const { ProfessorController, ProfessorDTO, professorRoutes } = require('../components/professors');
const { StudentController, StudentDTO, studentRoutes } = require('../components/students');
const { SubjectHistoryController, SubjectHistoryDTO, subjectHistoryRoutes } = require('../components/subjectHistory');
const { AcademicCareerController, AcademicCareerDTO, academicCareerRoutes } = require('../components/AcademicCareer');
const { SchoolYearController, SchoolYearDTO, schoolYearRoutes } = require('../components/schoolYear');
const { FailedSubjectController, FailedSubjectDTO, failedSubjectRoutes } = require('../components/failedSubject');
const { CurrentSubjectController, CurrentSubjectDTO, currentSubjectRoutes } = require('../components/currentSubject');
const { IntersemestralSubjectController, IntersemestralSubjectDTO, intersemestralSubjectRoutes } = require('../components/intersemestralSubject');
const { SeedController, seedRoutes } = require('../components/seeds');
const { AuthController } = require('../components/auth');

const FactoryController = require('../components/factory/factory.controller');

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
  regex,
} = require('../utils/');

// * Middlewares
const {
  handlerErrorNotFoundResource,
  handlerErrors,
  authMiddleware,
  uploadSingleFile,
  uploadMultiplesFiles,
} = require('../middlewares');

// * Services
const UserService = require('../../services/users/user.service');
const SubjectService = require('../../services/subjects/subject.service');
const CourseService = require('../../services/courses/course.service');
const ProfessorService = require('../../services/professors/professor.service');
const StudentService = require('../../services/students/student.service');
const AuthService = require('../../services/auth/auth.service');
const FileService = require('../../services/files/file.service');
const SeedService = require('../../services/seeds/seed.service');
const SubjectHistoryService = require('../../services/subjectHistory/subjectHistory.service');
const AcademicCareerService = require('../../services/academicCareer/academicCareer.service');
const SchoolYearService = require('../../services/schoolYear/SchoolYear.service');
const {
  CurrentSubjectsService,
  FailedSubjectsService,
  FeaturesSchoolYearService,
  SubjectsForSchoolYearService,
  IntersemestralSubjectsService
} = require('../../services/schoolYearProcess/');

const { EmailService, EmailTemplates } = require('../../services/email');

// * Data Access Layer
const { UserRepository, UserEntity } = require('../../dal/users');
const { SubjectRepository, SubjectEntity } = require('../../dal/subjects');
const { CourseRepository, CourseEntity } = require('../../dal/courses');
const { ProfessorRepository, ProfessorEntity } = require('../../dal/professors');
const { StudentRepository, StudentEntity } = require('../../dal/students');
const { SubjectHistoryRepository, SubjectHistoryEntity } = require('../../dal/subjectHistory');
const { AcademicCareerRepository, AcademicCareerEntity } = require('../../dal/academicCareer');
const { SchoolYearRepository, SchoolYearEntity } = require('../../dal/schoolYear');
const { CurrentSubjectsRepository, CurrentSubjectsEntity } = require('../../dal/currentSubjects');
const { FailedSubjectsRepository, FailedSubjectsEntity } = require('../../dal/failedSubjects');
const { IntersemestralSubjectsRepository, IntersemestralSubjectsEntity } = require('../../dal/intersemestralSubjects');

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
    regex: asValue(regex),
  })
  // * middlewares
  .register({
    handlerErrorNotFoundResource: asFunction(
      () => handlerErrorNotFoundResource
    ),
    handlerErrors: asFunction(handlerErrors),
    AuthMiddleware: asFunction(authMiddleware).singleton(),
    UploadSingleFile: asFunction(uploadSingleFile).singleton(),
    UploadMultiplesFiles: asFunction(uploadMultiplesFiles).singleton(),
  })
  // Factory Controller
  .register({
    FactoryController: asFunction(() => FactoryController),
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
    courseMiddleware: asFunction(courseMiddleware).singleton(),
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
  // * Academic Career
  .register({
    AcademicCareerRepository: asClass(AcademicCareerRepository).singleton(),
    AcademicCareerEntity: asValue(AcademicCareerEntity),
    AcademicCareerController: asFunction(AcademicCareerController).singleton(),
    academicCareerRoutes: asFunction(academicCareerRoutes).singleton(),
    AcademicCareerDTO: asClass(AcademicCareerDTO).singleton(),
    AcademicCareerService: asClass(AcademicCareerService).singleton(),
  })
  // * School Year
  .register({
    SchoolYearRepository: asClass(SchoolYearRepository).singleton(),
    SchoolYearEntity: asValue(SchoolYearEntity),
    SchoolYearController: asFunction(SchoolYearController).singleton(),
    schoolYearRoutes: asFunction(schoolYearRoutes).singleton(),
    SchoolYearDTO: asClass(SchoolYearDTO).singleton(),
    SchoolYearService: asClass(SchoolYearService).singleton(),
    FeaturesSchoolYearService: asClass(FeaturesSchoolYearService).singleton(),
    SubjectsForSchoolYearService: asClass(SubjectsForSchoolYearService).singleton(),
  })
  // * Student
  .register({
    StudentController: asFunction(StudentController).singleton(),
    studentRoutes: asFunction(studentRoutes).singleton(),
    StudentDTO: asClass(StudentDTO).singleton(),
    StudentService: asClass(StudentService).singleton(),
    StudentRepository: asClass(StudentRepository).singleton(),
    StudentEntity: asValue(StudentEntity),
  })
  // * Subject History
  .register({
    SubjectHistoryController: asFunction(SubjectHistoryController).singleton(),
    subjectHistoryRoutes: asFunction(subjectHistoryRoutes).singleton(),
    SubjectHistoryDTO: asClass(SubjectHistoryDTO).singleton(),
    SubjectHistoryRepository: asClass(SubjectHistoryRepository).singleton(),
    SubjectHistoryEntity: asValue(SubjectHistoryEntity),
    SubjectHistoryService: asClass(SubjectHistoryService).singleton(),
  })
  // * Current Subjects File
  .register({
    CurrentSubjectsRepository: asClass(CurrentSubjectsRepository).singleton(),
    CurrentSubjectsEntity: asValue(CurrentSubjectsEntity),
    CurrentSubjectsService: asClass(CurrentSubjectsService).singleton(),
    CurrentSubjectController: asFunction(CurrentSubjectController).singleton(),
    currentSubjectRoutes: asFunction(currentSubjectRoutes).singleton(),
    CurrentSubjectDTO: asClass(CurrentSubjectDTO).singleton(),
  })
  // * Failed Subjects File
  .register({
    FailedSubjectsRepository: asClass(FailedSubjectsRepository).singleton(),
    FailedSubjectsEntity: asValue(FailedSubjectsEntity),
    FailedSubjectsService: asClass(FailedSubjectsService).singleton(),
    FailedSubjectController: asFunction(FailedSubjectController).singleton(),
    failedSubjectRoutes: asFunction(failedSubjectRoutes).singleton(),
    FailedSubjectDTO: asClass(FailedSubjectDTO).singleton(),
  })
  // * Intersemestral Subjects File
  .register({
    IntersemestralSubjectsRepository: asClass(IntersemestralSubjectsRepository).singleton(),
    IntersemestralSubjectsEntity: asValue(IntersemestralSubjectsEntity),
    IntersemestralSubjectsService: asClass(IntersemestralSubjectsService).singleton(),
    IntersemestralSubjectController: asFunction(IntersemestralSubjectController).singleton(),
    intersemestralSubjectRoutes: asFunction(intersemestralSubjectRoutes).singleton(),
    IntersemestralSubjectDTO: asClass(IntersemestralSubjectDTO).singleton(),
  })
  // * Files
  .register({
    FileController: asFunction(FileController).singleton(),
    fileRoutes: asFunction(fileRoutes).singleton(),
    FileService: asClass(FileService).singleton(),
  })
  // * Seeds
  .register({
    SeedService: asClass(SeedService).singleton(),
    SeedController: asFunction(SeedController).singleton(),
    seedRoutes: asFunction(seedRoutes).singleton(),
  })
  .register({
    ErrorController: asClass(ErrorController).singleton(),
    ErrorDTO: asClass(ErrorDTO).singleton(),
  })
  .register({
    AuthController: asFunction(AuthController).singleton(),
    AuthService: asClass(AuthService).singleton(),
  })
  .register({
    EmailService: asClass(EmailService),
    EmailTemplates: asClass(EmailTemplates),
  });

module.exports = container;
