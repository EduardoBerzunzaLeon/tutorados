module.exports = ({
    catchAsync,
    findDocs,
    SubjectDTO,
    SubjectService,
  }) => {

    const self = {
      service: SubjectService,
      dto: SubjectDTO,
      catchAsync,
    };
  

    
    const findSubjectById = (self) => async (req, res) => {
      const { id } = req.params;
      const subject = await self.service.findById(id);
      const subjectSend =  self.dto.single(subject);

      return res.status(200).json({ 
        status: 'success',
        data: subjectSend
      });
    }
    
    const updateSubject = (self) => async (req, res) => {
      const { id } = req.params;
      const subject = await self.service.updateById(id, req.body);
      const subjectSend = self.dto.single(subject);
  
      return res.status(200).json({
        status: 'success',
        data: subjectSend,
      });
    };

  
    const createSubject = (self) => async (req, res) => {
      const subject = await self.service.create(req.body);
      const subjectSend = self.dto.single(subject);
  
      return res.status(200).json({
        status: 'success',
        data: subjectSend,
      });
    };

  
    const deleteSubject = (self) => async (req, res) => {
        const { id } = req.params;
        await self.service.deleteById(id);
        return res.status(204).json({
            status: 'success',
            data: null
        })
    }

    const methods = (self) => ({
        findSubjects: self.catchAsync(findDocs(self)),
        findSubjectById: self.catchAsync(findSubjectById(self)),
        updateSubject: self.catchAsync(updateSubject(self)),
        createSubject: self.catchAsync(createSubject(self)),
        deleteSubject: self.catchAsync(deleteSubject(self)),
    });
  
    return methods(self);
  };
  