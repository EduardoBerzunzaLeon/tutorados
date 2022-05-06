const { Router } = require('express');

module.exports = function ({ config, userRoutes, subjectRoutes, professorRoutes, courseRoutes, fileRoutes }) {
  const router = Router();
  const apiRoute = Router();

  apiRoute.use('/users', userRoutes);
  apiRoute.use('/subjects', subjectRoutes);
  apiRoute.use('/subjects', subjectRoutes);
  apiRoute.use('/professors', professorRoutes);
  apiRoute.use('/courses', courseRoutes);

  router.use(`/api/${config.API_VERSION}`, apiRoute);
  router.use(`/`, fileRoutes);

  return router;
};
