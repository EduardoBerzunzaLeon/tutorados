class UserRepository {
  constructor({ UserEntity }) {
    this._user = UserEntity;
  }

  async getUsers() {
    const users = await this._user.find();
    return users;
  }
}

module.exports = UserRepository;
