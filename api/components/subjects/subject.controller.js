module.exports = ({
    catchAsync,
    FactoryController,
    SubjectDTO,
    SubjectService,
  }) => {

    const self = {
      catchAsync,
      dto: SubjectDTO,
      service: SubjectService,
    };
  
    const methods = (self) => ({
        createSubject: self.catchAsync(FactoryController.create(self)),
        deleteSubject: self.catchAsync(FactoryController.deleteById(self)),
        findSubjectById: self.catchAsync(FactoryController.findById(self)),
        findSubjects: self.catchAsync(FactoryController.findDocs(self)),
        updateSubject: self.catchAsync(FactoryController.updateById(self)),
    });
  
    return methods(self);
  };
  