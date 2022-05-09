module.exports = ({
    catchAsync,
    CourseDTO,
    CourseService,
    FactoryController,
    FileService,
  }) => {

    const self = {
      courseService: CourseService,
      fileService: FileService,
      courseDTO: CourseDTO,
      catchAsync,
    };
  
    
    // const updateCourse = (self) => async (req, res) => {
    //   const { id } = req.params;

    //   req.body.professor = req.body.professor || req.params?.professorId;

    //   const course = await self.courseService.updateById(id, req.body);
    //   const courseSend = self.courseDTO.single(course);
  
    //   return res.status(200).json({
    //     status: 'success',
    //     data: courseSend,
    //   });
    // };

  
    // const createCourse = (self) => async (req, res) => {

    //   req.body.professor = req.body.professor || req.params?.professorId;

    //   const course = await self.courseService.create(req.body);
    //   const courseSend = self.courseDTO.single(course);
  
    //   return res.status(200).json({
    //     status: 'success',
    //     data: courseSend,
    //   });
    // };
  
    const methods = (self) => ({
        findCourses: self.catchAsync(FactoryController.findDocs(self)),
        findCourseById: self.catchAsync(FactoryController.findById(self)),
        updateCourse: self.catchAsync(FactoryController.updateById(self)),
        createCourse: self.catchAsync(FactoryController.create(self)),
        deleteCourse: self.catchAsync(FactoryController.deleteById(self)),
    });
  
    return methods(self);
  };
  