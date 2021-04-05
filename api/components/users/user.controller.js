class UserController {
  constructor({ UserService, UserDTO }) {
    this._userService = UserService;
    this._userDTO = UserDTO;
  }

  async getUsers(req, res) {
    const users = await this._userService.getUsers();
    const usersSend = this._userDTO.multiple(users, null);

    return res.status(200).json({
      ok: true,
      data: usersSend,
    });
  }
}

module.exports = UserController;
