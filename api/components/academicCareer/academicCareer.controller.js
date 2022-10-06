module.exports = ({
    catchAsync,
    FactoryController,
    AcademicCareerDTO,
    AcademicCareerService,
  }) => {

    const self = {
      catchAsync,
      dto: AcademicCareerDTO,
      service: AcademicCareerService,
    };
  
    const generate = (self) => async (req, res) => {

      const { id }= req.params;
      await self.service.generate({ ...req.body, userId: id, authenticatedUser: req.user._id });

      return res.status(201).json({
        status: 'success',
      });
    }
    
    const update = (self) => async (req, res) => {

      const { id, subjectId }= req.params;
      await self.service.update({ 
        ...req.body, 
        userId: id,
        subjectId,
        authenticatedUser: req.user._id
       });

      return res.status(201).json({
        status: 'success',
      });
    }

    const methods = (self) => ({
      generate: self.catchAsync(generate(self)),
      update: self.catchAsync(update(self)),
      findDataToExcel: self.catchAsync(FactoryController.findByMethod(
        self.service.findDataToExcel.bind(AcademicCareerService),
        self.dto.multipleExcel.bind(AcademicCareerDTO)
      )),
      findByUserId: self.catchAsync(FactoryController.findById(self)),
    });
  
    return methods(self);
  };
  