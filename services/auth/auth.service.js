class AuthService {
  constructor({ UserRepository }) {
    this._userRepository = UserRepository;
  }

  async signup({ name, email, password, confirmPassword }) {
    const userExists = await this._userRepository.getUserByUsername(name);
    return await this._userRepository.getUsers();
  }

  // async create() {}

  // async findOne() {}
  // async findById() {}
  // save method
}

module.exports = AuthService;
