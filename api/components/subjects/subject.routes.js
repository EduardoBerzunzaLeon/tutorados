const { Router } = require('express');

module.exports = function({
    SubjectController,
    AuthMiddleware,
    config
}) {
    const router = Router();
    const {
        get_subjects,
        delete_subjects,
        update_subjects,
        create_subjects
    } = config.PERMISSIONS_LIST.subject;
    
    const { restrictTo, protect } = AuthMiddleware;

    router.use(protect);
    
    router.get('/excel', restrictTo(get_subjects), SubjectController.findSubjectsForExcel);
    router.get('/:id', restrictTo(get_subjects), SubjectController.findSubjectById);
    router.get('/', restrictTo(get_subjects), SubjectController.findSubjects);

    router.post('/', restrictTo(create_subjects), SubjectController.createSubject);

    router.patch('/:id',  restrictTo(update_subjects),  SubjectController.updateSubject);
    router.patch('/:id/correlative', restrictTo(update_subjects), SubjectController.updateCorrelativeSubjects);
    
    router.delete('/:id', restrictTo(delete_subjects), SubjectController.deleteSubject );
    
    return router;
}