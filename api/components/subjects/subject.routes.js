const { Router } = require('express');

module.exports = function({
    SubjectController,
    AuthMiddleware
}) {
    const router = Router();

    router.use(AuthMiddleware.protect);
    router.use(AuthMiddleware.restrictTo('admin'));
    
    router.get('/excel', SubjectController.findSubjectsForExcel);
    router.get('/:id', SubjectController.findSubjectById);
    router.get('/', SubjectController.findSubjects);

    router.post('/', SubjectController.createSubject);

    router.patch('/:id', SubjectController.updateSubject);
    router.patch('/:id/correlative', SubjectController.updateCorrelativeSubjects);
    
    router.delete('/:id', SubjectController.deleteSubject );
    
    return router;
}