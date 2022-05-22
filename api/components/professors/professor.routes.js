const { Router } = require('express');

module.exports = function({
    ProfessorController,
    AuthMiddleware,
    UploadSingleFile,
    courseRoutes
}) {
    const router = Router();
    
    router.use(AuthMiddleware.protect);
    router.use(AuthMiddleware.restrictTo('admin'));
    router.use('/:professorId/courses', courseRoutes);
    
    router.post('/', 
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'),
    ProfessorController.createProfessor);
    
    router.patch('/:id',
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'),
    ProfessorController.updateProfessor);

    router.get('/excel', ProfessorController.findProfessorsForExcel);
    router.get('/:id', ProfessorController.findProfessorById);
    router.get('/', ProfessorController.findProfessors);

    router.delete('/:id', ProfessorController.deleteProfessor );

    router.patch('/:id/active', ProfessorController.setActive);

    return router;
}