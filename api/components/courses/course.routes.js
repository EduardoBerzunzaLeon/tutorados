const { Router } = require('express');

module.exports = function({
    CourseController,
    AuthMiddleware,
    courseMiddleware,
    config
}) {
    const {
        get_courses,
        delete_courses,
        update_courses,
        create_courses
    } = config.PERMISSIONS_LIST.course;
    const { restrictTo, protect } = AuthMiddleware;

    const router = Router({ mergeParams: true });

    router.use(protect);
    
    router.post('/', 
        courseMiddleware.verifyProfessorInBody,
        restrictTo(create_courses),
        CourseController.createCourse);

    router.patch('/:id', 
        courseMiddleware.verifyProfessorInBody, 
        restrictTo(update_courses),
        CourseController.updateCourse);

    router.get('/:id',
        restrictTo(get_courses),
        CourseController.findCourseById);

    router.get('/', 
        courseMiddleware.verifyProfessorInParams,
        restrictTo(get_courses), 
        CourseController.findCourses);

    router.delete('/:id', 
        restrictTo(delete_courses),
        CourseController.deleteCourse);

    return router;
}