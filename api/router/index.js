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
  academicCareerRoutes,
  schoolYearRoutes,
  failedSubjectRoutes,
  currentSubjectRoutes,
  intersemestralSubjectRoutes,
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
  apiRoute.use('/academicCareer', academicCareerRoutes);
  apiRoute.use('/schoolYear', schoolYearRoutes);
  apiRoute.use('/seed', seedRoutes);
  apiRoute.use('/failedSubjects', failedSubjectRoutes);
  apiRoute.use('/currentSubjects', currentSubjectRoutes);
  apiRoute.use('/interSubjects', intersemestralSubjectRoutes);

  router.use(`/api/${config.API_VERSION}`, apiRoute);
  router.use(`/`, fileRoutes);

  return router;
};
