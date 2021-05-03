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
    const uploadAvatar = this.fileService.uploadFile('img');
    const image = await uploadAvatar.bind(this.fileService, file)();
    const imageSavedInEntity = await this.fileService.saveInEntity(
      id,
      this.userRepository,
      image,
      'avatar'
    );
    return imageSavedInEntity;
  }
}

module.exports = UserService;
