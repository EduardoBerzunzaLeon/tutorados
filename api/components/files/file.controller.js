module.exports = ({
    catchAsync,
    FileService,
  }) => {
    const self = {
      fileService: FileService,
      catchAsync,
    };
  
    const getImage = (self) => async (req, res) => {
      const { folder, imgName } = req.params;
      const file = await self.fileService.getImage(imgName, folder);
      return res.sendFile(file);
    };
    
  
    const methods = (self) => ({
        getImage: self.catchAsync(getImage(self)),
    });
  
    return methods(self);
  };
  