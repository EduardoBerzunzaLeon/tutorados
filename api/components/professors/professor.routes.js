const { Router } = require('express');

module.exports = function({
    ProfessorController,
    AuthMiddleware,
    UploadSingleFile,
    courseRoutes,
    config
}) {
    const router = Router();
    const {
        get_professors,
        delete_professors,
        update_professors,
        create_professors
    } = config.PERMISSIONS_LIST.professor;
    
    const { restrictTo, protect } = AuthMiddleware;
    
    router.use(protect);
    router.use('/:professorId/courses', courseRoutes);
    
    router.post('/', 
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'),
    restrictTo(create_professors),
    ProfessorController.createProfessor);
    
    router.patch('/:id',
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'),
    restrictTo(update_professors),
    ProfessorController.updateProfessor);

    router.get('/excel', restrictTo(get_professors), ProfessorController.findProfessorsForExcel);
    router.get('/:id', restrictTo(create_professors), ProfessorController.findProfessorById);
    router.get('/', restrictTo(get_professors), ProfessorController.findProfessors);
    router.get('/fullName/:fullName', restrictTo(get_professors), ProfessorController.findByFullName);

    router.delete('/:id', restrictTo(delete_professors), ProfessorController.deleteProfessor );

    router.patch('/:id/active', restrictTo(update_professors),  ProfessorController.setActive);

    return router;
}