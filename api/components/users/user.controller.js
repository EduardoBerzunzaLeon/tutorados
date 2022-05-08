module.exports = ({
  catchAsync,
  FileService,
  findDocs,
  UserDTO,
  UserService,
}) => {
  const self = {
    service: UserService,
    fileService: FileService,
    dto: UserDTO,
    catchAsync,
  };

  const findUserById = (self) => async (req, res) => {
    const { id } = req.params;
    
    const user = await self.service.findById(id);
    const userSend =  self.dto.single(user);
    return res.status(200).json({ 
      status: 'success',
      data: userSend
    })
  }
  
  
  const updateUser = (self) => async (req, res) => {
    const { id } = req.params;
    const user = await self.service.updateById(id, req.body);
    const userSend = self.dto.single(user);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };

  const updateAvatar = (self) => async (req, res) => {
    const { file, user } = req;
    const avatar = await self.service.uploadAvatar(user._id, file);

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
  
  const createUserByAdmin = (self) => async (req, res) => {
    const { file } = req;
    const user = await self.service.createUserByAdmin(req.body, file);
    const userSend = self.dto.single(user);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };
 
  const updatePasswordByAdmin = (self) => async (req, res) => {

    const { id } = req.params;
    const user = await self.service.updatePasswordByAdmin(id, req.body);
    const userSend = self.dto.single(user);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };

  const updateBlockedByAdmin = (self) => async (req, res) => {

    const { id } = req.params;
    const user = await self.service.updateBlockedByAdmin(id, req.body);
    const userSend = self.dto.single(user);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };

  const methods = (self) => ({
    findUsers: self.catchAsync(findDocs(self)),
    findUserById: self.catchAsync(findUserById(self)),
    updateAvatar: self.catchAsync(updateAvatar(self)),
    updateUser: self.catchAsync(updateUser(self)),
    updateUserByAdmin: self.catchAsync(updateUserByAdmin(self)),
    createUserByAdmin: self.catchAsync(createUserByAdmin(self)),
    updatePasswordByAdmin: self.catchAsync(updatePasswordByAdmin(self)),
    updateBlockedByAdmin: self.catchAsync(updateBlockedByAdmin(self)),
  });

  return methods(self);
};
