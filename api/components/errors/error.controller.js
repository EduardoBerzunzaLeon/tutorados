class ErrorController {
  constructor({ createAppError, ErrorDTO, getEnviroment }) {
    this.createAppError = createAppError;
    this.errorDTO = ErrorDTO;
    this.getDTO = this.createDTO(getEnviroment);
  }

  handleCastErrorDB = (err) => {
    const msg = `Invalid ${err.path}: ${err.value}`;
    return this.createAppError(msg, 400);
  };

  handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const msg = `Duplicate field value: ${value}. Please use another value!`;
    return this.createAppError(msg, 400);
  };

  handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.msg);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return this.createAppError(message, 400);
  };

  handleJWTError = () =>
    this.createAppError('Invalid token. Please log in again!', 401);

  handleJWTExpiredError = () =>
    this.createAppError('Your token has expired! Please log in again.', 401);

  handleErrorNotFound = (originalUrl) =>
    this.createAppError(`Can't find ${originalUrl} on this server!`, 404);

  createDTO = (env) => {
    const generateMethod = `sendError${env.charAt(0)}${env.slice(1)}`;
    return typeof this.errorDTO[generateMethod] === 'function'
      ? this.errorDTO[generateMethod]
      : this.errorDTO.sendErrorDevelopment;
  };

  getSpecificHandleError = (err, { originalUrl }) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    if (error.name === 'CastError') error = this.handleCastErrorDB(error);
    if (error.name === 'NotFoundResourceError')
      error = this.handleErrorNotFound(originalUrl);
    if (error.name === 'ValidationError')
      error = this.handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = this.handleJWTError();
    if (error.name === 'TokenExpiredError')
      error = this.handleJWTExpiredError();
    if (error?.code === 11000) error = this.handleDuplicateFieldsDB(error);

    return error;
  };
}

module.exports = ErrorController;
