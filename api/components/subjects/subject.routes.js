const { Router } = require('express');

module.exports = function({
    SubjectController,
    AuthMiddleware
}) {
    const router = Router();

    router.use(AuthMiddleware.protect);
    router.use(AuthMiddleware.restrictTo('admin'));
    
    router.post('/', SubjectController.createSubject);
    router.patch('/:id', SubjectController.updateSubject);
    router.get('/:id', SubjectController.findSubjectById);
    router.get('/', SubjectController.findSubjects);
    router.delete('/:id', SubjectController.deleteSubject );
    
    return router;
}