const { Router } = require('express');

module.exports = function({ config, teacherRoutes }) {
    const router = Router();
    const apiRoute = Router();

    apiRoute.use("/teacher", teacherRoutes);
    router.use(`/api/${config.API_VERSION}`, apiRoute);

    return router;
}