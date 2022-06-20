module.exports = ({
    catchAsync,
    FactoryController,
    StudentDTO,
    StudentService,
    UserService
  }) => {

    const self = {
      catchAsync,
      dto: StudentDTO,
      service: StudentService,
      userService: UserService,
    };
      

    const createStudent = (self) => async (req, res) => {
      const { file } = req;
      const body = {...req.body, roles: ['student'], blocked: false };

      const doc = await self.userService.create(body, file);
      const docSend = self.dto.single(doc);

      return res.status(200).json({
        status: 'success',
        data: docSend,
      });
    }

    const findProfessorsHistory = (self) => async (req, res) => {
      const { id } = req.params;
      const doc = await  self.service.findProfessorsHistory(id);
      const data =  self.dto.singleProfessorsHistory(doc);
  
      return res.status(200).json({ 
        status: 'success',
        data
      }); 
    }
    
    const addNewProfessor = (self) => async (req, res) => {
      const { id } = req.params;
      await  self.service.addNewProfessor(id, req.body);;
  
      return res.status(201).json({ 
        status: 'success',
      }); 
    }
    
    const deleteProfessorInHistory = (self) => async (req, res) => {
      const { id, professorId } = req.params;
      await self.service.deleteProfessorInHistory(id, professorId);
  
      return res.status(204).json({ 
        status: 'success',
      }); 
    }

    const updateProfessorInHistory = (self) => async (req, res) => {
    const { id, professorHistoryId } = req.params;

    await self.service.updateProfessorInHistory(id, professorHistoryId, req.body);  

      return res.status(204).json({ 
        status: 'success',
      }); 
    }


    const methods = (self) => ({
        findStudents: self.catchAsync(FactoryController.findDocs(self)),
        findProfessorsHistory: self.catchAsync(findProfessorsHistory(self)),
        createStudent: self.catchAsync(createStudent(self)),
        updateStudent: self.catchAsync(
          FactoryController.updateByMethod(
            self, 
            self.userService.updateUserStudent.bind(UserService)
          )
        ),
        addNewProfessor: self.catchAsync(addNewProfessor(self)),
        deleteProfessorInHistory: self.catchAsync(deleteProfessorInHistory(self)),
        updateProfessorInHistory: self.catchAsync(updateProfessorInHistory(self)),
    });
  
    return methods(self);
  };
  