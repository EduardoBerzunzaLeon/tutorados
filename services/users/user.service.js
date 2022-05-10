class UserService {
  constructor({ UserRepository, FileService, createAppError }) {
    this.userRepository = UserRepository;
    this.fileService = FileService;
    this.createAppError = createAppError;
  }


  checkFields({ name, gender, role, blocked, email }) {
    if (!name || !gender || !role || !blocked || !email) {
      throw this.createAppError('Todos los campos son obligatorios', 400);
    }
  }

  async find(query) {
    return await Promise.all(this.userRepository.findAll(query));
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

  async updateUserByAdmin(id, { first, last, email, gender, role, blocked }, file) {

    const name = { first, last };

    this.checkFields({ name, gender, role, blocked, email });

    if(file) {
      const uploadFile = this.fileService.uploadFile();
      const image = await uploadFile.bind(this.fileService, file)();
  
      await this.fileService.saveInDB(
        id,
        this.userRepository,
        image,
        'avatar'
      );
    }

    const userUpdated = await this.userRepository.updateById(id, { name, email, gender, role, blocked });

    if (!userUpdated)
      throw this.createAppError('No se pudo actualizar los datos', 400);

    return userUpdated;
  }
  
  async create({ first, last, email, gender, role, blocked }, file) {

    const name = { first, last };

    this.checkFields({ name, gender, role, blocked, email });

    const userExists = await this.userRepository.findOne({ email });

    if ( userExists ) throw this.createAppError('Usuario ya existe', 401);

    const userCreated = await this.userRepository.create({
      name,
      email,
      password: '123456789',
      confirmPassword: '123456789',
      gender,
      active: true,
      blocked,
      role,
    });

    if (!userCreated)
      throw this.createAppError('No se pudo concluir su registro', 500);


    if(file) {
      const uploadFile = this.fileService.uploadFile();
      const image = await uploadFile.bind(this.fileService, file)();
  
      try {
        await this.fileService.saveInDB(
          userCreated.id,
          this.userRepository,
          image,
          'avatar'
        );
      } catch (error) {
        await this.userRepository.deleteById(userCreated.id);
        throw error;
      }
      
    }

    return userCreated;
  }

  async updatePasswordByAdmin(id,{ password, confirmPassword }) {

    if(!id || !password || !confirmPassword) {
      throw this.createAppError('Todos los campos son obligatorios', 400);
    }

    const user = await this.userRepository.findById(id);

    if (!user)
      throw this.createAppError('No se encontro el usuario', 400);

    user.password = password;
    user.confirmPassword = confirmPassword;

    await this.userRepository.save(user);

    return user;
  }  


  async updateBlockedByAdmin(id, { blocked }) {

    if(!id || typeof blocked !== 'boolean') {
      throw this.createAppError('Todos los campos son obligatorios', 400);      
    }

    const user = await this.userRepository.updateById(id, { blocked });

    if (!user)
      throw this.createAppError('No se pudo actualizar los datos', 400);

    return user;

  }

}

module.exports = UserService;
