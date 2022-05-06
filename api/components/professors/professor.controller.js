module.exports = ({
    catchAsync,
    findDocs,
    FileService,
    ProfessorDTO,
    ProfessorService,
  }) => {

    const self = {
      service: ProfessorService,
      fileService: FileService,
      dto: ProfessorDTO,
      catchAsync,
    };
    
    const findProfessorById = (self) => async (req, res) => {
      const { id } = req.params;
      const professor = await self.service.findById(id);
      const professorSend =  self.dto.single(professor);
      
      return res.status(200).json({ 
        status: 'success',
        data: professorSend
      });
    }
    
    const updateProfessor = (self) => async (req, res) => {
      const { id } = req.params;
      const { file } = req;
      const professor = await self.service.updateById(id, req.body, file);
      const professorSend = self.dto.single(professor);
  
      return res.status(200).json({
        status: 'success',
        data: professorSend,
      });
    };

  
    const createProfessor = (self) => async (req, res) => {
        const { file } = req;

        const professor = await self.service.create(req.body, file);
        const professorSend = self.dto.single(professor);

        return res.status(200).json({
            status: 'success',
            data: professorSend,
        });
    };

    const deleteProfessor = (self) => async (req, res) => {
      const { id } = req.params;
      await self.service.deleteById(id);
      return res.status(204).json({
        status: 'success',
        data: null,
      });
    }

  
    const methods = (self) => ({
        findProfessors: self.catchAsync(findDocs(self)),
        findProfessorById: self.catchAsync(findProfessorById(self)),
        updateProfessor: self.catchAsync(updateProfessor(self)),
        createProfessor: self.catchAsync(createProfessor(self)),
        deleteProfessor: self.catchAsync(deleteProfessor(self)),
    });
  
    return methods(self);
  };
  