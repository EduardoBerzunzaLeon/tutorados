module.exports = ({ UserService, UserDTO, catchAsync, FileService }) => {
  const self = {
    userService: UserService,
    fileService: FileService,
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

  const uptadeAvatar = (self) => async (req, res) => {
    console.log(req.file);
    return res.status(200).json({
      status: 'success',
    });
    // const uploadAvatar = self.fileService.uploadFile('', 'images', 'avatar');
    // await uploadAvatar(req.file);
  };

  const methods = (self) => ({
    getUsers: self.catchAsync(getUsers(self)),
    uptadeAvatar: self.catchAsync(uptadeAvatar(self)),
  });

  return methods(self);
};
