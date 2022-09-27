const { Router } = require('express');

module.exports = function({
    AcademicCareerController,
    AuthMiddleware,
    config
}) {
    const router = Router();
    const {
        create_academic_career,
    } = config.PERMISSIONS_LIST.academicCareer;
    
    const { restrictTo, protect } = AuthMiddleware;

    router.use(protect);

    router.post('/:userId', restrictTo(create_academic_career), AcademicCareerController.generate);

    return router;
}