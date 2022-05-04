module.exports = ({
    ProfessorService,
    ProfessorDTO,
    catchAsync,
    FileService,
    ProfessorRepository,
  }) => {

    const self = {
      professorService: ProfessorService,
      fileService: FileService,
      professorRepository: ProfessorRepository,
      professorDTO: ProfessorDTO,
      catchAsync,
    };
  
    const findProfessors = (self) => async (req, res) => {
      const [ total, professors ] = await self.professorService.findProfessors(req.query);
      const professorsSend = self.professorDTO.multiple(professors, null);
  
      return res.status(200).json({
        status: 'success',
        total,
        data: professorsSend,
      });
    };
    
    const findProfessorById = (self) => async (req, res) => {
      const { id } = req.params;
      const professor = await self.professorService.findById(id);
      const professorSend =  self.professorDTO.single(professor, null);
      
      return res.status(200).json({ 
        status: 'success',
        data: professorSend
      });
    }
    
    const updateProfessor = (self) => async (req, res) => {
      const { id } = req.params;
      const { file } = req;
      const professor = await self.professorService.updateById(id, req.body, file);
      const professorSend = self.professorDTO.single(professor, null);
  
      return res.status(200).json({
        status: 'success',
        data: professorSend,
      });
    };

  
    const createProfessor = (self) => async (req, res) => {
        const { file } = req;
        const professor = await self.professorService.create(req.body, file);
        const professorSend = self.professorDTO.single(professor, null);

        return res.status(200).json({
            status: 'success',
            data: professorSend,
        });
    };

    const deleteProfessor = (self) => async (req, res) => {
      const { id } = req.params;
      await self.professorService.deleteProfessor(id);
      return res.status(204).json({
        status: 'success',
        data: null,
      });
    }

  
    const methods = (self) => ({
        findProfessors: self.catchAsync(findProfessors(self)),
        findProfessorById: self.catchAsync(findProfessorById(self)),
        updateProfessor: self.catchAsync(updateProfessor(self)),
        createProfessor: self.catchAsync(createProfessor(self)),
        deleteProfessor: self.catchAsync(deleteProfessor(self)),
    });
  
    return methods(self);
  };
  