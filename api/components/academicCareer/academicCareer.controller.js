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
      const dataSend = self.dto.single(data);

      return res.status(201).json({
        status: 'success',
        data: dataSend
      });
    }
    
    const update = (self) => async (req, res) => {

      const { userId, subjectId }= req.params;

      const data = await self.service.update({ 
        ...req.body, 
        userId,
        subjectId,
        authenticatedUser: req.user._id
       });
       
      const dataSend = self.dto.single(data);

      return res.status(201).json({
        status: 'success',
        data: dataSend
      });
    }
    

    

    const methods = (self) => ({
      generate: self.catchAsync(generate(self)),
      update: self.catchAsync(update(self)),
      findById: self.catchAsync(generate(self)),
    });
  
    return methods(self);
  };
  