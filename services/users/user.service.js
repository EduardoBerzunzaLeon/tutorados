class UserService {
  constructor({ UserRepository }) {
    this._userRepository = UserRepository;
  }

  async getUsers() {
    return await this._userRepository.getUsers();
  }

  // async create() {}

  // async findOne() {}
  // async findById() {}
  // save method
}

module.exports = UserService;
