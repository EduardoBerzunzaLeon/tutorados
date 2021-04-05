class UserController {
  constructor({ UserService, UserDTO, catchAsync }) {
    this._userService = UserService;
    this._userDTO = UserDTO;
    this.catchAsync = catchAsync;
  }

  async getUsers(req, res) {
    const users = await this._userService.getUsers();
    const usersSend = this._userDTO.multiple(users, null);

    return res.status(200).json({
      status: 'success',
      data: usersSend,
    });
  }
}

module.exports = UserController;
