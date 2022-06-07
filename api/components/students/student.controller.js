module.exports = ({
    catchAsync,
    FactoryController,
    StudentDTO,
    StudentService,
  }) => {

    const self = {
      catchAsync,
      dto: StudentDTO,
      service: StudentService,
    };
      
    const methods = (self) => ({
        findStudents: self.catchAsync(FactoryController.findDocs(self)),
        // ! TODO: CREATE FOR TESTING PURPOSE ONLY
        createStudent: self.catchAsync(FactoryController.create(self)),
    });
  
    return methods(self);
  };
  