const { Router } = require('express');

module.exports = function({
    CourseController,
    AuthMiddleware,
    UploadSingleFile,
}) {
    const router = Router();

    router.use(AuthMiddleware.restrictTo('admin'))
    
    router.post('/', 
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'),
    CourseController.createCourse);
    
    router.patch('/:id',
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'),
    CourseController.updateCourse);

    router.get('/:id', CourseController.findCourseById);
    router.get('/', CourseController.findCourses);
    router.delete('/:id', CourseController.deleteCourse );
}