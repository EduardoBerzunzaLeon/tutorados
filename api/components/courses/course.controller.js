module.exports = ({
    catchAsync,
    CourseDTO,
    CourseService,
    FileService,
  }) => {

    const self = {
      courseService: CourseService,
      fileService: FileService,
      courseDTO: CourseDTO,
      catchAsync,
    };
 
    

    const findCourses = (self) => async (req, res) => {

      const filter =  req.params.professorId ? { professor:  req.params.professorId } : {};

      const query = Object.assign(req.query, {...filter});

      return self.factoryController.findDocs({
        service: self.courseService,
        dto: self.courseDTO,
        query,
        res
      });

    };
    
    const findCourseById = (self) => async (req, res) => {
      const { id } = req.params;
      const course = await self.courseService.findById(id);
      const courseSend =  self.courseDTO.single(course);
      
      return res.status(200).json({ 
        status: 'success',
        data: courseSend
      });
    }
    
    const updateCourse = (self) => async (req, res) => {
      const { id } = req.params;

      req.body.professor = req.body.professor || req.params?.professorId;

      const course = await self.courseService.updateById(id, req.body);
      const courseSend = self.courseDTO.single(course);
  
      return res.status(200).json({
        status: 'success',
        data: courseSend,
      });
    };

  
    const createCourse = (self) => async (req, res) => {

      req.body.professor = req.body.professor || req.params?.professorId;

      const course = await self.courseService.create(req.body);
      const courseSend = self.courseDTO.single(course);
  
      return res.status(200).json({
        status: 'success',
        data: courseSend,
      });
    };


    const deleteCourse = (self) => async (req, res) => {
      const { id } = req.params;
      await self.courseService.deleteById(id);
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
  