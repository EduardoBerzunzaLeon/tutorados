module.exports = {
  handlerErrorNotFoundResource: require('./errorNotFound.middleware'),
  handlerErrors: require('./handlerErrors.middleware'),
  authMiddleware: require('./auth.middleware'),
  uploadSingleFile: require('./uploadFiles.middleware'),
};
