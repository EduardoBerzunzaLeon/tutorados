const { Router } = require('express');

module.exports = function({
    AcademicCareerController,
    AuthMiddleware,
    config
}) {
    const router = Router();
    const {
        create_academic_career,
        get_academic_career,
        update_academic_career
    } = config.PERMISSIONS_LIST.academicCareer;
    
    const { restrictTo, protect } = AuthMiddleware;

    router.use(protect);

    router.get('/:userId', restrictTo(get_academic_career), AcademicCareerController.findById);
    router.patch('/:userId/subject/:subjectId', restrictTo(update_academic_career), AcademicCareerController.update);
    router.post('/:userId', restrictTo(create_academic_career), AcademicCareerController.generate);

    return router;
}