class UserService {
  constructor({ UserRepository }) {
    this.userRepository = UserRepository;
  }

  async getUsers() {
    return await this.userRepository.getUsers();
  }
}

module.exports = UserService;
