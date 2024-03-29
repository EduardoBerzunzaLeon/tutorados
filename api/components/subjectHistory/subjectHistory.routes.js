const { Router } = require('express');

module.exports = function({
    SubjectHistoryController,
    AuthMiddleware,
    config
}) {
    const router = Router();
    const {
        get_subject_history,
        delete_subject_history,
        update_subject_history,
        create_subject_history
    } = config.PERMISSIONS_LIST.subjectHistory;
    
    const { restrictTo, protect } = AuthMiddleware;

    router.use(protect);

    router.get('/:id', restrictTo(get_subject_history), SubjectHistoryController.findCurrentSubjects);
    router.get('/:id/history', restrictTo(get_subject_history), SubjectHistoryController.findHistory);
    router.get('/:id/unstudy', restrictTo(get_subject_history), SubjectHistoryController.findUnstudySubjects);
    router.get('/:id/subjects', restrictTo(get_subject_history), SubjectHistoryController.findPossibleSubjectsToAdd);

    router.post('/', restrictTo(create_subject_history), SubjectHistoryController.createSubjectInHistory);
    router.delete(
        '/:phaseId/phase', 
        restrictTo(delete_subject_history), 
        SubjectHistoryController.deletePhase
    );
    router.patch(
        '/:phaseId/phase', 
        restrictTo(update_subject_history), 
        SubjectHistoryController.updatePhase
    );

    return router;
}