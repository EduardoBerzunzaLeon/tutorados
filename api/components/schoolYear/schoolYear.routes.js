const { Router } = require('express');

module.exports = function({
    SchoolYearController,
    AuthMiddleware,
    config
}) {
    const router = Router();
    const {
        create_school_year,
        get_school_year,
    } = config.PERMISSIONS_LIST.schoolYear;
    
    const { restrictTo, protect } = AuthMiddleware;

    router.use(protect);

    router.get('/', restrictTo(get_school_year), SchoolYearController.findCurrentSchoolYear);
    router.post('/', restrictTo(create_school_year), SchoolYearController.create);

    return router;
}