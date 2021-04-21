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
    const msg = `Duplicate field value: ${value}. Please use another value!`;
    return this.createAppError(msg, 400);
  };

  handleValidationErrorDB = ({ errors }) => {
    const errorsPrepare = Object.values(errors).map((el) => el.msg);
    const message = `Invalid input data. ${errorsPrepare.join('. ')}`;
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
    const error = this.cloneError(err);

    if (error.name === 'CastError') return this.handleCastErrorDB(error);
    if (error.name === 'NotFoundResourceError')
      return this.handleErrorNotFound(originalUrl);
    if (error.name === 'ValidationError')
      return this.handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') return this.handleJWTError();
    if (error.name === 'TokenExpiredError') return this.handleJWTExpiredError();
    if (error?.code === 11000) return this.handleDuplicateFieldsDB(error);

    return error;
  };
}

module.exports = ErrorController;
