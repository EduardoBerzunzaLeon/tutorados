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

  const getUsers = (self) => async (req, res) => {
    const [ total, users ] = await self.userService.getUsers(req.query);
    const usersSend = self.userDTO.multiple(users, null);

    return res.status(200).json({
      status: 'success',
      total,
      data: usersSend,
    });
  };
  
  const getUserById = (self) => async (req, res) => {
    const { id } = req.params;
    
    const user = await self.userService.findById(id);
    const userSend =  self.userDTO.single(user, null);
    return res.status(200).json({ 
      status: 'success',
      data: userSend
    })
  }
  
  
  const updateUser = (self) => async (req, res) => {
    const { id } = req.params;
    const user = await self.userService.updateById(id, req.body);
    const userSend = self.userDTO.single(user, null);

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
    const userSend = self.userDTO.single(user, null);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };
  
  const createUserByAdmin = (self) => async (req, res) => {
    const { file } = req;
    const user = await self.userService.createUserByAdmin(req.body, file);
    const userSend = self.userDTO.single(user, null);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };
 
  const updatePasswordByAdmin = (self) => async (req, res) => {

    const { id } = req.params;
    const user = await self.userService.updatePasswordByAdmin(id, req.body);
    const userSend = self.userDTO.single(user, null);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };

  const changeBlockedByAdmin = (self) => async (req, res) => {

    const { id } = req.params;
    const user = await self.userService.changeBlockedByAdmin(id, req.body);
    const userSend = self.userDTO.single(user, null);

    return res.status(200).json({
      status: 'success',
      data: userSend,
    });
  };

  const methods = (self) => ({
    getUsers: self.catchAsync(getUsers(self)),
    getUserById: self.catchAsync(getUserById(self)),
    updateAvatar: self.catchAsync(updateAvatar(self)),
    updateUser: self.catchAsync(updateUser(self)),
    updateUserByAdmin: self.catchAsync(updateUserByAdmin(self)),
    createUserByAdmin: self.catchAsync(createUserByAdmin(self)),
    updatePasswordByAdmin: self.catchAsync(updatePasswordByAdmin(self)),
    changeBlockedByAdmin: self.catchAsync(changeBlockedByAdmin(self)),
  });

  return methods(self);
};
