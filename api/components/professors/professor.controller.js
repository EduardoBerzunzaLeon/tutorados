module.exports = ({
    catchAsync,
    FactoryController,
    FileService,
    ProfessorDTO,
    ProfessorService,
    UserService,
  }) => {

    const self = {
      catchAsync,
      dto: ProfessorDTO,
      fileService: FileService,
      service: ProfessorService,
      userService: UserService,
    };

    const findProfessorsForExcel = (self) =>  async (req, res) => {
      const docs = await self.service.findForExcel();
      const docsSend = self.dto.multipleExcel(docs);
  
      return res.status(200).json({
        status: 'success',
        data: docsSend,
      });
    }

    const findByFullName = (self) =>  async (req, res) => {
      const [ total, docs ]  = await self.service.findByFullName(req.params.fullName);
      const docsSend = self.dto.multipleFullName(docs);
  
      return res.status(200).json({
        status: 'success',
        total,
        data: docsSend,
      });
    }

    const createProfessor = (self) => async (req, res) => {
      const { file } = req;
      const body = {...req.body, roles: ['professor'], blocked: false};
      const doc = await self.userService.create(body, file);
      const docSend = self.dto.single(doc);

      return res.status(200).json({
        status: 'success',
        data: docSend,
      });
    }
    
      
    const methods = (self) => ({
        createProfessor: self.catchAsync(createProfessor(self)),
        deleteProfessor: self.catchAsync(FactoryController.deleteById(self)),
        findProfessorById: self.catchAsync(FactoryController.findById(self)),
        findProfessors: self.catchAsync(FactoryController.findDocs(self)),
        updateProfessor: self.catchAsync(FactoryController.updateByMethod(self, self.userService.updateUserProfessor.bind(UserService))),
        findProfessorsForExcel: self.catchAsync(findProfessorsForExcel(self)),
        findByFullName: self.catchAsync(findByFullName(self)),
        setActive: self.catchAsync(FactoryController.updateByMethod(self, self.service.setActive.bind(ProfessorService))),
    });
  
    return methods(self);
  };
  