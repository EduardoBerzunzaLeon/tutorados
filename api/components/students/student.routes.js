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
        update_students,
        delete_students
    } = config.PERMISSIONS_LIST.student;
    
    const { restrictTo, protect } = AuthMiddleware;
    
    router.use(protect);
    
    router.get('/', restrictTo(get_students), StudentController.findStudents);
    router.get('/:id/professors', restrictTo(get_students), StudentController.findProfessorsHistory);

    router.post(
        '/', 
        UploadSingleFile(regex.imageExtRegex, '2000', 'avatar'), restrictTo(create_students),
        StudentController.createStudent
        );
    router.post('/:id/professors', restrictTo(create_students), StudentController.addNewProfessor);
    
    router.patch(
        '/:id',
        UploadSingleFile(regex.imageExtRegex, '2000','avatar'),
        restrictTo(update_students),
        StudentController.updateStudent
    );
        
    router.delete(
        '/:id/professors/:professorId', 
        restrictTo(delete_students), 
        StudentController.deleteProfessorInHistory
    );
    
    router.patch(
        '/:id/professors/:professorHistoryId', 
        restrictTo(update_students), 
        StudentController.updateProfessorInHistory
    );

    return router;
}