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
  
    const findByUserId = (self) => async (req, res) => {
      const { id } = req.params;
      const doc = await  self.service.findByUserId(id);
      const data =  self.dto.single(doc);
  
      return res.status(200).json({ 
        status: 'success',
        data
      }); 
    }
    
    const findHistoryByUserId = (self) => async (req, res) => {
      const { id } = req.params;
      const doc = await  self.service.findHistoryByUserId(id);
      const data =  self.dto.multipleHistory(doc);
  
      return res.status(200).json({ 
        status: 'success',
        data
      }); 
    }
    
    const findUnstudySubjects = (self) => async (req, res) => {
      const { id } = req.params;
      const doc = await  self.service.findUnstudySubjects(id);
      const data =  self.dto.multipleUnstudy(doc);
  
      return res.status(200).json({ 
        status: 'success',
        data
      }); 
    }
    
    const addNewPhase = (self) => async (req, res) => {
      const { id } = req.params;
      
      const request = {
        ...req.body,
        docId: id
      }

      await  self.service.addNewPhase(request);
  
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
      findByUserId: self.catchAsync(findByUserId(self)),
      findHistoryByUserId: self.catchAsync(findHistoryByUserId(self)),
      findUnstudySubjects: self.catchAsync(findUnstudySubjects(self)),
      createSubjectInHistory: self.catchAsync(FactoryController.create(self)),
      addNewPhase: self.catchAsync(addNewPhase(self)),
      deletePhase: self.catchAsync(deletePhase(self)),
      updatePhase: self.catchAsync(updatePhase(self)),
    });
  
    return methods(self);
  };
  