class ErrorController {
  constructor({ createAppError, ErrorDTO, getEnviroment }) {
    this.createAppError = createAppError;
    this.errorDTO = ErrorDTO;
    this.getDTO = this.createDTO(getEnviroment);
  }

  cloneError = (err) => {
    const error = { ...err };
    error.message = err.message;
    error.stack = err.stack;
    return error;
  };

  handleCastErrorDB = ({ path, value }) => {
    const msg = `Invalid ${path}: ${value}`;
    return this.createAppError(msg, 400);
  };

  handleDuplicateFieldsDB = ({ message }) => {
    const value = message.match(/(["'])(\\?.)*?\1/)[0];
    const msg = `El valor ${value} ya existe. Favor de ingresar otro valor`;
    return this.createAppError(msg, 400);
  };

  handleValidationErrorDB = ({ errors }) => {
    const errorsPrepare = Object.values(errors).map(
      ({ properties }) => properties.message
    );

    const message = errorsPrepare.join('. ');

    return this.createAppError(message, 400);
  };

  handleMulterError = ({ code }) => {
    const errorMessages = {
      FILE_UNEXPECTED_EXTENSION: 'El archivo tiene extensiones no validas',
      FILE_MOVE_DIRECTORY: 'No se pudo mover el archivo',
      FILE_SAVE_MODEL: 'Ocurrio un error al grabar la imagen al modelo',
      FILE_NO_FILE: 'No se envio el archivo',
      FILE_NO_DELETE: 'No se pudo eliminar el archivo',
      // Multer event handler
      LIMIT_PART_COUNT: 'Demasiadas partes',
      LIMIT_FILE_SIZE: 'Archivo muy grande',
      LIMIT_FILE_COUNT: 'Demasiados archivos',
      LIMIT_FIELD_KEY: 'Nombre del archivo muy grande',
      LIMIT_FIELD_VALUE: 'Valor del campo muy largo',
      LIMIT_FIELD_COUNT: 'Demasiados campos de archivos',
      LIMIT_UNEXPECTED_FILE: 'Campo inesperado',
      GENERIC_ERROR: 'Ocurrio un error en la subida del archivo',
    };

    const message = errorMessages.hasOwnProperty(code)
      ? errorMessages[code]
      : errorMessages['GENERIC_ERROR'];

    return this.createAppError(message, 400);
  };

  handleJWTError = () =>
    this.createAppError('Invalid token. Please log in again!', 401);

  handleJWTExpiredError = () =>
    this.createAppError('Your token has expired! Please log in again.', 401);

  handleErrorNotFound = (originalUrl) =>
    this.createAppError(`Can't find ${originalUrl} on this server!`, 404);

  createDTO = (env) => {
    const generateMethod = `sendError${env.charAt(0).toUpperCase()}${env.slice(
      1
    )}`;
    return typeof this.errorDTO[generateMethod] === 'function'
      ? this.errorDTO[generateMethod]
      : this.errorDTO.sendErrorDevelopment;
  };

  getSpecificHandleError = (err, { originalUrl }) => {
    const error = this.cloneError(err);

    if (error.stack.startsWith('CastError'))
      return this.handleCastErrorDB(error);
    if (error.name === 'NotFoundResourceError')
      return this.handleErrorNotFound(originalUrl);
    if (error.stack.startsWith('ValidationError'))
      return this.handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') return this.handleJWTError();
    if (error.name === 'TokenExpiredError') return this.handleJWTExpiredError();
    if (error?.code === 11000) return this.handleDuplicateFieldsDB(error);
    if (error.name === 'MulterError') return this.handleMulterError(error);

    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    error.isOperational = error.isOperational || true;

    return error;
  };
}

module.exports = ErrorController;
