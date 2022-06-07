const { Router } = require('express');

module.exports = function({
    StudentController,
    AuthMiddleware,
    config
}) {
    const router = Router();
    const {
        get_students,
        create_students
    } = config.PERMISSIONS_LIST.student;
    
    const { restrictTo, protect } = AuthMiddleware;
    
    router.use(protect);
    
    router.get('/', restrictTo(get_students), StudentController.findStudents);
    router.post('/', restrictTo(create_students), StudentController.createStudent);

    return router;
}