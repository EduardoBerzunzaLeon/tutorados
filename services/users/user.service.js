class UserService {
  constructor({ UserRepository }) {
    this._userRepository = UserRepository;
  }

  async getUsers() {
    return await this._userRepository.getUsers();
  }
}

module.exports = UserService;
