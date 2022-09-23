module.exports = ({
    catchAsync,
    FactoryController,
    SubjectHistoryDTO,
    SubjectHistoryService,
  }) => {

    const self = {
      catchAsync,
      dto: SubjectHistoryDTO,
      service: SubjectHistoryService,
    };
  

    
    const create = (self) => async (req, res) => {
      await self.service.create(req.body);
  
      return res.status(201).json({
        status: 'success',
      });
    }
    
    const deletePhase = (self) => async (req, res) => {
      const { phaseId } = req.params;
      await self.service.deletePhase( phaseId );
  
      return res.status(204).json({ 
        status: 'success',
      }); 
    }

    const updatePhase = (self) => async (req, res) => {

      const { phaseId } = req.params;

      const request = {
        ...req.body,
        phaseId
      }

      await self.service.updatePhase(request);  

      return res.status(204).json({ 
        status: 'success',
      }); 
    }

    const methods = (self) => ({
      findCurrentSubjects: self.catchAsync(FactoryController.findByMethod(
        self.service.findCurrentSubjects.bind(SubjectHistoryService),
        self.dto.singleComplete.bind(SubjectHistoryDTO)
      )),
      findHistory: self.catchAsync(FactoryController.findByMethod(
        self.service.findHistory.bind(SubjectHistoryService),
        self.dto.multipleHistory.bind(SubjectHistoryDTO)
      )),
      findUnstudySubjects: self.catchAsync(FactoryController.findByMethod(
        self.service.findUnstudySubjects.bind(SubjectHistoryService),
        self.dto.multipleSubject.bind(SubjectHistoryDTO)
      )),
      findPossibleSubjectsToAdd: self.catchAsync(FactoryController.findByMethod(
        self.service.findPossibleSubjectsToAdd.bind(SubjectHistoryService),
        self.dto.multipleSubject.bind(SubjectHistoryDTO)
      )),
      createSubjectInHistory: self.catchAsync(create(self)),
      deletePhase: self.catchAsync(deletePhase(self)),
      updatePhase: self.catchAsync(updatePhase(self)),
    });
  
    return methods(self);
  };
  