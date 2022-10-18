module.exports = ({
    catchAsync,
    FactoryController,
    SchoolYearDTO,
    SchoolYearService,
  }) => {

    const self = {
      catchAsync,
      dto: SchoolYearDTO,
      service: SchoolYearService,
    };
  
    
    const create = (self) => async (req, res) => {

      await self.service.create({ 
        files: req.files.files, 
        authenticatedUser: req.user._id
       });

      return res.status(201).json({
        status: 'success',
      });
    }

    const methods = (self) => ({
      create: self.catchAsync(create(self)),
      findCurrentSchoolYear: self.catchAsync(FactoryController.findByMethod(
        self.service.findCurrentSchoolYear.bind(SchoolYearService),
        self.dto.single.bind(SchoolYearDTO)
      )),
    });
  
    return methods(self);
  };
  