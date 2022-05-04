module.exports = ({
    CourseService,
    CourseDTO,
    catchAsync,
    FileService,
    CourseRepository,
  }) => {

    const self = {
      courseService: CourseService,
      fileService: FileService,
      courseRepository: CourseRepository,
      courseDTO: CourseDTO,
      catchAsync,
    };
  
    const findCourses = (self) => async (req, res) => {
      const [ total, courses ] = await self.courseService.findCourses(req.query);
      const coursesSend = self.courseDTO.multiple(courses, null);
  
      return res.status(200).json({
        status: 'success',
        total,
        data: coursesSend,
      });
    };
    
    const findCourseById = (self) => async (req, res) => {
      const { id } = req.params;
      const course = await self.courseService.findById(id);
      const courseSend =  self.courseDTO.single(course, null);
      
      return res.status(200).json({ 
        status: 'success',
        data: courseSend
      });
    }
    
    const updateCourse = (self) => async (req, res) => {
      const { id } = req.params;
      const course = await self.courseService.updateById(id, req.body);
      const courseSend = self.courseDTO.single(course, null);
  
      return res.status(200).json({
        status: 'success',
        data: courseSend,
      });
    };

  
    const createCourse = (self) => async (req, res) => {
      const course = await self.courseService.create(req.body);
      const courseSend = self.courseDTO.single(course, null);
  
      return res.status(200).json({
        status: 'success',
        data: courseSend,
      });
    };


    const deleteCourse = (self) => async (req, res) => {
      const { id } = req.params;
      await self.courseService.deleteCourse(id);
      return res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  
    const methods = (self) => ({
        findCourses: self.catchAsync(findCourses(self)),
        findCourseById: self.catchAsync(findCourseById(self)),
        updateCourse: self.catchAsync(updateCourse(self)),
        createCourse: self.catchAsync(createCourse(self)),
        deleteCourse: self.catchAsync(deleteCourse(self)),
    });
  
    return methods(self);
  };
  