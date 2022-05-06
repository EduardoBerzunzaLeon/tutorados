const { Router } = require('express');

module.exports = function({
    CourseController,
    AuthMiddleware
}) {
    const router = Router({ mergeParams: true });

    router.use(AuthMiddleware.protect);
    router.use(AuthMiddleware.restrictTo('admin'));
    
    router.post('/', CourseController.createCourse);
    router.patch('/:id', CourseController.updateCourse);
    router.get('/:id', CourseController.findCourseById);
    router.get('/', CourseController.findCourses);
    router.delete('/:id', CourseController.deleteCourse );

    return router;
}