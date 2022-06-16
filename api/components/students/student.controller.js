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

    const methods = (self) => ({
        findStudents: self.catchAsync(FactoryController.findDocs(self)),
        createStudent: self.catchAsync(createStudent(self)),
    });
  
    return methods(self);
  };
  