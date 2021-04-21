class UserService {
  constructor({ UserRepository }) {
    this.userRepository = UserRepository;
  }

  async getUsers(query) {
    return await this.userRepository.findAll(query);
  }

  async findById(id) {
    return await this.userRepository.findById(id);
  }
}

module.exports = UserService;
