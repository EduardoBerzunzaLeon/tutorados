class UserService {
  constructor({ UserRepository }) {
    this.userRepository = UserRepository;
  }

  async getUsers() {
    return await this.userRepository.getUsers();
  }

  async findById(id) {
    return await this.userRepository.findById(id);
  }
}

module.exports = UserService;
