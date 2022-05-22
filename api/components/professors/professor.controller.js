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

    const findProfessorsForExcel = (self) =>  async (req, res) => {
      const docs = await self.service.findForExcel();
      const docsSend = self.dto.multipleExcel(docs);
  
      return res.status(200).json({
        status: 'success',
        data: docsSend,
      });
    }


      
    const methods = (self) => ({
        createProfessor: self.catchAsync(FactoryController.createWithFile(self)),
        deleteProfessor: self.catchAsync(FactoryController.deleteById(self)),
        findProfessorById: self.catchAsync(FactoryController.findById(self)),
        findProfessors: self.catchAsync(FactoryController.findDocs(self)),
        updateProfessor: self.catchAsync(FactoryController.updateWithFile(self)),
        findProfessorsForExcel: self.catchAsync(findProfessorsForExcel(self)),
        setActive: self.catchAsync(FactoryController.updateByMethod(self, self.service.setActive.bind(ProfessorService))),
    });
  
    return methods(self);
  };
  