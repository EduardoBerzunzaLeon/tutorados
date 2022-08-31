module.exports = ({
  catchAsync,
  SeedService,
  getEnviroment,
  createAppError
}) => {

  const self = {
    catchAsync,
    enviroment: getEnviroment,
    service: SeedService,
    sendError: createAppError
  };


  const loadSeed = ({ enviroment, service, sendError }) => async (req, res) => {

    // console.log(enviroment);
    if( enviroment !== 'development' ) {
      throw sendError('Permission denied', 401);
    }

    await service.loadCollections();

    return res.status(201).json({
      status: 'success',
    });
  };


  const methods = (self) => ({
      loadSeed: self.catchAsync(loadSeed(self)),
  });

  return methods(self);
};
