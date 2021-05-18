const handlerErrors =
  ({ ErrorController }) =>
  (err, req, res, next) => {
    const sendError = ErrorController.getDTO;
    const error = ErrorController.getSpecificHandleError(err, req);

    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    const prepareError = ErrorController.cloneError(error);

    return res.status(error.statusCode).json(sendError(prepareError));
  };

module.exports = handlerErrors;
