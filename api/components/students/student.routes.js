const { Router } = require('express');

module.exports = function({
    StudentController,
    AuthMiddleware,
    UploadSingleFile,
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
    router.post('/', 
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'), restrictTo(create_students),
    StudentController.createStudent);

    return router;
}