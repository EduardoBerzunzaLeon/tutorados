const { Router } = require('express');

module.exports = function({ TeacherController }) {
    const router = Router();
    router.get('/', TeacherController.getTeachers.bind(TeacherController));
    return router;
}