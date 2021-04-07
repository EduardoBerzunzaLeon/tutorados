class UserRepository {
  constructor({ UserEntity }) {
    this._user = UserEntity;
  }

  async create({ name, email, password, confirmPassword }) {
    return await this._user.create([
      {
        name,
        email,
        password,
        confirmPassword,
      },
    ]);
  }

  // TODO: Create this methods
  // findOne
  // findOneByEmailAndPassword
  // save
  // findById

  async getUsers() {
    const users = await this._user.find();
    return users;
  }
}

module.exports = UserRepository;
