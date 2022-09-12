const { Router } = require('express');

module.exports = function ({ 
  config, 
  userRoutes, 
  subjectRoutes,
  professorRoutes,
  studentRoutes,
  courseRoutes,
  fileRoutes,
  seedRoutes,
  subjectHistoryRoutes,
 }) {
  const router = Router();
  const apiRoute = Router();

  apiRoute.use('/users', userRoutes);
  apiRoute.use('/subjects', subjectRoutes);
  apiRoute.use('/subjects', subjectRoutes);
  apiRoute.use('/professors', professorRoutes);
  apiRoute.use('/courses', courseRoutes);
  apiRoute.use('/students', studentRoutes);
  apiRoute.use('/subjectHistory', subjectHistoryRoutes);
  apiRoute.use('/seed', seedRoutes);

  router.use(`/api/${config.API_VERSION}`, apiRoute);
  router.use(`/`, fileRoutes);

  return router;
};
