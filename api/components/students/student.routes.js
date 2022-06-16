const { Router } = require('express');

module.exports = function({
    StudentController,
    AuthMiddleware,
    UploadSingleFile,
    regex,
    config
}) {
    const router = Router();
    const {
        get_students,
        create_students,
        update_students
    } = config.PERMISSIONS_LIST.student;
    
    const { restrictTo, protect } = AuthMiddleware;
    
    router.use(protect);
    
    router.get('/', restrictTo(get_students), StudentController.findStudents);
    
    router.post(
        '/', 
        UploadSingleFile(regex.imageExtRegex, '2000', 'avatar'), restrictTo(create_students),
        StudentController.createStudent
    );

    router.patch(
        '/:id',
        UploadSingleFile(regex.imageExtRegex, '2000','avatar'),
        restrictTo(update_students),
        StudentController.updateStudent
    );

    return router;
}