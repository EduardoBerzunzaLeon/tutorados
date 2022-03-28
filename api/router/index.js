const { Router } = require('express');

module.exports = function ({ config, userRoutes, fileRoutes }) {
  const router = Router();
  const apiRoute = Router();

  apiRoute.use('/users', userRoutes);
  router.use(`/api/${config.API_VERSION}`, apiRoute);
  router.use(`/`, fileRoutes);

  return router;
};
