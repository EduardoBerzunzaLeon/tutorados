module.exports = ({
    SubjectService,
    SubjectDTO,
    catchAsync,
    FileService,
    SubjectRepository,
  }) => {

    const self = {
      subjectService: SubjectService,
      fileService: FileService,
      subjectRepository: SubjectRepository,
      subjectDTO: SubjectDTO,
      catchAsync,
    };
  
    const findSubjects = (self) => async (req, res) => {
      const [ total, subjects ] = await self.subjectService.findSubjects(req.query);
      const subjectsSend = self.subjectDTO.multiple(subjects, null);
  
      return res.status(200).json({
        status: 'success',
        total,
        data: subjectsSend,
      });
    };
    
    const findSubjectById = (self) => async (req, res) => {
      const { id } = req.params;
      const subject = await self.subjectService.findById(id);
      const subjectSend =  self.subjectDTO.single(subject, null);

      return res.status(200).json({ 
        status: 'success',
        data: subjectSend
      });
    }
    
    const updateSubject = (self) => async (req, res) => {
      const { id } = req.params;
      const subject = await self.subjectService.updateById(id, req.body);
      const subjectSend = self.subjectDTO.single(subject, null);
  
      return res.status(200).json({
        status: 'success',
        data: subjectSend,
      });
    };

  
    const createSubject = (self) => async (req, res) => {
      const subject = await self.subjectService.create(req.body);
      const subjectSend = self.subjectDTO.single(subject, null);
  
      return res.status(200).json({
        status: 'success',
        data: subjectSend,
      });
    };

  
    const deleteSubject = (self) => async (req, res) => {
        const { id } = req.params;
        await self.subjectService.deleteById(id);
        return res.status(204).json({
            status: 'success',
            data: null
        })
    }

    const methods = (self) => ({
        findSubjects: self.catchAsync(findSubjects(self)),
        findSubjectById: self.catchAsync(findSubjectById(self)),
        updateSubject: self.catchAsync(updateSubject(self)),
        createSubject: self.catchAsync(createSubject(self)),
        deleteSubject: self.catchAsync(deleteSubject(self)),
    });
  
    return methods(self);
  };
  