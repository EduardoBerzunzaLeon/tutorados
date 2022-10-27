const { Router } = require('express');

module.exports = function({
    CurrentSubjectController,
    AuthMiddleware,
    config
}) {
    const router = Router();
    const {
        get_school_year,
    } = config.PERMISSIONS_LIST.schoolYear;
    const { restrictTo, protect } = AuthMiddleware;

    router.use(protect);
    router.get('/', restrictTo(get_school_year), CurrentSubjectController.findErrors);

    return router;
} 