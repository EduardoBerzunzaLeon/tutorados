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
    const users = await self.userService.getUsers(req.query);
    const usersSend = self.userDTO.multiple(users, null);

    return res.status(200).json({
      status: 'success',
      data: usersSend,
    });
  };

  const updateAvatar = (self) => async (req, res) => {
    const { file, user } = req;
    const avatar = await self.userService.uploadAvatar(user._id, file);

    return res.status(200).json({
      status: 'success',
      data: {
        avatar,
      },
    });
  };

  const methods = (self) => ({
    getUsers: self.catchAsync(getUsers(self)),
    updateAvatar: self.catchAsync(updateAvatar(self)),
  });

  return methods(self);
};
