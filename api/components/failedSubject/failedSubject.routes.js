const { Router } = require('express');

module.exports = function({
    FailedSubjectController,
    AuthMiddleware,
    config
}) {
    const router = Router();
    const {
        get_school_year,
    } = config.PERMISSIONS_LIST.schoolYear;
    const { restrictTo, protect } = AuthMiddleware;

    router.use(protect);
    router.get('/', restrictTo(get_school_year), FailedSubjectController.findErrors);

    return router;
} 