class UserService {
  constructor({ UserRepository, FileService, createAppError }) {
    this.userRepository = UserRepository;
    this.fileService = FileService;
    this.createAppError = createAppError;
  }

  async getUsers(query) {
    return await this.userRepository.findAll(query);
  }

  async findById(id) {

    if(!id) {
      throw this.createAppError(
        'El ID es obligatorio',
        400
      );
    }

    const user = await this.userRepository.findById(id);

    if(!user) {
      throw this.createAppError(
        'ID incorrecto',
        404
      );
    }

    return user;
  }

  async findActiveUser(_id) {
    return await this.userRepository.findOne({ _id, active: true });
  }

  async uploadAvatar(id, file) {
    // Move the temp file to images folder
    const uploadFile = this.fileService.uploadFile();
    const image = await uploadFile.bind(this.fileService, file)();

    // Save Image in DataBase
    return await this.fileService.saveInDB(
      id,
      this.userRepository,
      image,
      'avatar'
    );
  }

  async updateById(id, { name, email, gender}) {

    if (!name || !gender) throw this.createAppError('Todos los campos son obligatorios', 402);

    const userUpdated = await this.userRepository.updateById(id, { name, email, gender });

    if (!userUpdated)
      throw this.createAppError('No se pudo actualizar los datos', 400);

    return userUpdated;
  }
}

module.exports = UserService;
