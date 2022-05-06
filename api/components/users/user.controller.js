module.exports = ({
  UserService,
  UserDTO,
  catchAsync,
  FileService,
  UserRepository,
}) => {
  const self = {
    userService: UserService,
    fileService: FileService,
    userRepository: UserRepository,
    userDTO: UserDTO,
    catchAsync,
  };

  const findUsers = (self) => async (req, res) => {
    const [ total, users ] = await self.userService.find(req.query);
    const usersSend = self.userDTO.multiple(users);

    return res.status(200).json({
      status: 'success',
      total,
      data: usersSend,
    });
  };
  
  const findUserById = (self) => async (req, res) => {
    const { id } = req.params;
    
    const user = await self.userService.findById(id);
    const userSend =  self.userDTO.single(user);
    return res.status(200).json({ 
      status: 'success',
      data: userSend
    })
  }
  
  
  const updateUser = (self) => async (req, res) => {
    const { id } = req.params;
    const user = await self.userService.updateById(id, req.body);
    const userSend = self.userDTO.single(user);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };

  const updateAvatar = (self) => async (req, res) => {
    const { file, user } = req;
    const avatar = await self.userService.uploadAvatar(user._id, file);

    return res.status(200).json({
      status: 'success',
      data: {
        avatar: self.userDTO.getCompleteURLAvatar(avatar),
      },
    });
  };

  const updateUserByAdmin = (self) => async (req, res) => {
    const { id } = req.params;
    const { file } = req;
    const user = await self.userService.updateUserByAdmin(id, req.body, file);
    const userSend = self.userDTO.single(user);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };
  
  const createUserByAdmin = (self) => async (req, res) => {
    const { file } = req;
    const user = await self.userService.createUserByAdmin(req.body, file);
    const userSend = self.userDTO.single(user);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };
 
  const updatePasswordByAdmin = (self) => async (req, res) => {

    const { id } = req.params;
    const user = await self.userService.updatePasswordByAdmin(id, req.body);
    const userSend = self.userDTO.single(user);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };

  const updateBlockedByAdmin = (self) => async (req, res) => {

    const { id } = req.params;
    const user = await self.userService.updateBlockedByAdmin(id, req.body);
    const userSend = self.userDTO.single(user);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };

  const methods = (self) => ({
    findUsers: self.catchAsync(findUsers(self)),
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
