class UserService {
  constructor({ UserRepository, FileService }) {
    this.userRepository = UserRepository;
    this.fileService = FileService;
  }

  async getUsers(query) {
    return await this.userRepository.findAll(query);
  }

  async findById(id) {
    return await this.userRepository.findById(id);
  }

  async uploadAvatar(id, file) {
    // Move the temp file to images folder
    const uploadAvatar = this.fileService.uploadFile();
    const image = await uploadAvatar.bind(this.fileService, file)();
    // Save Image in DataBase
    const imageSavedInDB = await this.fileService.saveInDB(
      id,
      this.userRepository,
      image,
      'avatar'
    );
    return imageSavedInDB;
  }
}

module.exports = UserService;
