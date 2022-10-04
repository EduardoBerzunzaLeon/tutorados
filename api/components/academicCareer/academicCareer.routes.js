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

    router.get('/:id', restrictTo(get_academic_career), AcademicCareerController.findByUserId);
    router.get('/:id/excel', restrictTo(get_academic_career), AcademicCareerController.findDataToExcel);
    router.patch('/:id/subject/:subjectId', restrictTo(update_academic_career), AcademicCareerController.update);
    router.post('/:id', restrictTo(create_academic_career), AcademicCareerController.generate);

    return router;
}