const { Router } = require('express');

module.exports = function({
    CourseController,
    AuthMiddleware,
    courseMiddleware,
}) {
    const router = Router({ mergeParams: true });

    router.use(AuthMiddleware.protect);
    router.use(AuthMiddleware.restrictTo('admin'));
    
    router.post('/', courseMiddleware.verifyProfessorInBody, CourseController.createCourse);
    router.patch('/:id', courseMiddleware.verifyProfessorInBody, CourseController.updateCourse);
    router.get('/:id',  CourseController.findCourseById);
    router.get('/', courseMiddleware.verifyProfessorInParams, CourseController.findCourses);
    router.delete('/:id', CourseController.deleteCourse );

    return router;
}