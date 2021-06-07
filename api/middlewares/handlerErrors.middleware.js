const handlerErrors =
  ({ ErrorController }) =>
  (err, req, res, next) => {
    const sendError = ErrorController.getDTO;
    const error = ErrorController.getSpecificHandleError(err, req);
    const prepareError = ErrorController.cloneError(error);
    return res.status(error.statusCode).json(sendError(prepareError));
  };

module.exports = handlerErrors;
