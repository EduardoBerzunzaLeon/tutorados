const { assert } = require('chai');

const container = require('../../../../api/startup/container');
const ErrorController = container.resolve('ErrorController');
const createAppError = container.resolve('createAppError');
const UserRepository = container.resolve('UserRepository');

const { initialize, data } = require('../../../initialization/user');

describe('Error controller', () => {
  let userAdmin;
  before(async () => {
    await initialize(data);
    userAdmin = await UserRepository.findOne({ email: data[0].email });
  });

  let genericError = createAppError('This is a generic error', 401);

  it('Should clone the error with message and stack', () => {
    const error = ErrorController.cloneError(genericError);
    assert.property(error, 'stack');
    assert.equal(error.message, 'This is a generic error');
  });

  it('Should returned a error object with status 400', () => {
    const path = 'password';
    const value = '123456';
    const error = ErrorController.handleCastErrorDB({ path, value });
    const verifyText = `Invalid ${path}: ${value}`;
    assert.deepInclude(error, {
      isOperational: true,
      statusCode: 400,
      message: verifyText,
    });
  });

  it('Should returned a error object with status 400 when duplicate fields in the DB', async () => {
    let errorDuplicateKey = {};
    const verifyText = `El valor "${data[0].email}" ya existe. Favor de ingresar otro valor`;
    try {
      await UserRepository.create(data[0]);
    } catch (error) {
      errorDuplicateKey = ErrorController.cloneError(error);
    }

    const error = ErrorController.handleDuplicateFieldsDB(errorDuplicateKey);

    assert.deepInclude(error, {
      isOperational: true,
      statusCode: 400,
      message: verifyText,
    });
  });

  it('Should returned a error object with status 400 when validation DB failed', async () => {
    const verifyText =
      'Las contraseñas no coinciden. El password debe ser mínimo de 8 carácteres';
    let errorValidation = {};
    try {
      await UserRepository.updateById(userAdmin.id, {
        password: '1234',
        confirmPassword: '12345',
      });
    } catch (error) {
      errorValidation = ErrorController.cloneError(error);
    }

    const error = ErrorController.handleValidationErrorDB(errorValidation);

    assert.deepInclude(error, {
      isOperational: true,
      statusCode: 400,
      message: verifyText,
    });
  });

  it('Should returned a error object with status 400, multer error', () => {
    const verifyText = 'El archivo tiene extensiones no validas';
    const error = ErrorController.handleMulterError({
      code: 'FILE_UNEXPECTED_EXTENSION',
    });
    assert.deepInclude(error, {
      isOperational: true,
      statusCode: 400,
      message: verifyText,
    });
  });

  it('Should returned a error object with status 400, multer error generic', () => {
    const verifyText = 'Ocurrio un error en la subida del archivo';
    const error = ErrorController.handleMulterError({
      code: 'NO_EXISTS_THIS_PROPERTY',
    });
    assert.deepInclude(error, {
      isOperational: true,
      statusCode: 400,
      message: verifyText,
    });
  });

  it('Should returned a error object with status 401', () => {
    const verifyText = 'Invalid token. Please log in again!';
    const error = ErrorController.handleJWTError();
    assert.deepInclude(error, {
      isOperational: true,
      statusCode: 401,
      message: verifyText,
    });
  });

  it('Should returned a error object with status 401, JWT Expired error', () => {
    const verifyText = 'Your token has expired! Please log in again.';
    const error = ErrorController.handleJWTExpiredError();
    assert.deepInclude(error, {
      isOperational: true,
      statusCode: 401,
      message: verifyText,
    });
  });

  it('Should returned a error object with status 404, Not found resource', () => {
    const originalUrl = '/users/not-found';
    const verifyText = `Can't find ${originalUrl} on this server!`;
    const error = ErrorController.handleErrorNotFound(originalUrl);
    assert.deepInclude(error, {
      isOperational: true,
      statusCode: 404,
      message: verifyText,
    });
  });

  it('Should return a DTO function, depending on the environment', () => {
    const dtoFunction = ErrorController.createDTO('production');
    assert.isFunction(dtoFunction);
    assert.equal(dtoFunction.name, 'sendErrorProduction');
  });

  it('Should return a development DTO function by default when not exists the enviroment DTO', () => {
    const dtoFunction = ErrorController.createDTO('noExists');
    assert.isFunction(dtoFunction);
    assert.equal(dtoFunction.name, 'sendErrorDevelopment');
  });

  it('Should return a Multer Error', () => {
    const verifyText = 'Demasiados archivos';
    const newError = new Error('Nuevo error');
    const multerError = {
      ...ErrorController.cloneError(newError),
      name: 'MulterError',
      code: 'LIMIT_FILE_COUNT',
    };

    const error = ErrorController.getSpecificHandleError(multerError, {});

    assert.deepInclude(error, {
      isOperational: true,
      statusCode: 400,
      message: verifyText,
    });
  });

  it('Should return a generic error when not catch in ifs', () => {
    const verifyText = 'this is a generic error';
    const genericError = new Error(verifyText);
    const error = ErrorController.getSpecificHandleError(genericError, {});

    assert.deepInclude(error, {
      isOperational: true,
      statusCode: 500,
      message: verifyText,
    });
  });
});
