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

      const { userId }= req.params;

      const data = await self.service.generate({ ...req.body, userId, authenticatedUser: req.user._id });
      const dataSend = self.dto.multiple(data);

      return res.status(201).json({
        status: 'success',
        data: dataSend
      });
    }
    

    const methods = (self) => ({
      generate: self.catchAsync(generate(self)),
    });
  
    return methods(self);
  };
  