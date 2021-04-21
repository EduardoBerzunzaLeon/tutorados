module.exports = ({ UserService, UserDTO, catchAsync }) => {
  const self = {
    userService: UserService,
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

  const methods = (self) => ({
    getUsers: self.catchAsync(getUsers(self)),
  });

  return methods(self);
};
