module.exports = ({
    catchAsync,
    FactoryController,
    FileService,
    ProfessorDTO,
    ProfessorService,
  }) => {

    const self = {
      catchAsync,
      dto: ProfessorDTO,
      fileService: FileService,
      service: ProfessorService,
    };
      
    const methods = (self) => ({
        createProfessor: self.catchAsync(FactoryController.createWithFile(self)),
        deleteProfessor: self.catchAsync(FactoryController.deleteById(self)),
        findProfessorById: self.catchAsync(FactoryController.findById(self)),
        findProfessors: self.catchAsync(FactoryController.findDocs(self)),
        updateProfessor: self.catchAsync(FactoryController.updateWithFile(self)),
    });
  
    return methods(self);
  };
  