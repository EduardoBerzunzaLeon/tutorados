module.exports = ({
  catchAsync,
  FactoryController,
  FileService,
  UserDTO,
  UserService,
}) => {

  const self = {
    catchAsync,
    dto: UserDTO,
    fileService: FileService,
    service: UserService,
  };

  
  const updateAvatar = (self) => async (req, res) => {
    const { file, user } = req;
    const avatar = await self.service.uploadAvatar(file, user._id);

    return res.status(200).json({
      status: 'success',
      data: {
        avatar: self.dto.getCompleteURLAvatar(avatar),
      },
    });
  };

  const updateUserByAdmin = (self) => async (req, res) => {
    const { id } = req.params;
    const { file } = req;
    const user = await self.service.updateUserByAdmin(id, req.body, file);
    const userSend = self.dto.single(user);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };
 

  const methods = (self) => ({
    createUserByAdmin: self.catchAsync(FactoryController.createWithFile(self)),
    findUserById: self.catchAsync(FactoryController.findById(self)),
    findUsers: self.catchAsync(FactoryController.findDocs(self)),
    updateAvatar: self.catchAsync(updateAvatar(self)),
    updateBlockedByAdmin: self.catchAsync(FactoryController.updateByMethod(self, self.service.updateBlockedByAdmin.bind(UserService))),
    updatePasswordByAdmin: self.catchAsync(FactoryController.updateByMethod(self, self.service.updatePasswordByAdmin.bind(UserService))),
    updateUser: self.catchAsync(FactoryController.updateById(self)),
    updateUserByAdmin: self.catchAsync(updateUserByAdmin(self)),
  });

  return methods(self);
};
