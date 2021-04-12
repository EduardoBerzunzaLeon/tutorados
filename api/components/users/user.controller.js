class UserController {
  constructor({ UserService, UserDTO, catchAsync }) {
    this.userService = UserService;
    this.userDTO = UserDTO;
    this.catchAsync = catchAsync;
  }

  async getUsers(req, res) {
    const users = await this.userService.getUsers();
    const usersSend = this.userDTO.multiple(users, null);

    return res.status(200).json({
      status: 'success',
      data: usersSend,
    });
  }
}

module.exports = UserController;
