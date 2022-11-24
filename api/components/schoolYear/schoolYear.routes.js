const { Router } = require('express');

module.exports = function({
    SchoolYearController,
    AuthMiddleware,
    UploadMultiplesFiles,
    config
}) {
    const router = Router();
    const {
        create_school_year,
        get_school_year,
    } = config.PERMISSIONS_LIST.schoolYear;
    
    const { restrictTo, protect, verifyPassword } = AuthMiddleware;

    router.use(protect);

    router.get('/', restrictTo(get_school_year), SchoolYearController.findCurrentSchoolYear);
    router.post('/', restrictTo(create_school_year), 
    UploadMultiplesFiles(/\.(csv|txt)$/i, '3', 'files'),
    verifyPassword,
    SchoolYearController.create);

    return router;
}