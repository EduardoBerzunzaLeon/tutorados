class UserService {
  constructor({ 
    UserRepository, 
    ProfessorService, 
    StudentService,  
    FileService, 
    createAppError 
  }) {
    this.professorService = ProfessorService;
    this.studentService = StudentService;
    this.userRepository = UserRepository;
    this.fileService = FileService;
    this.createAppError = createAppError;
  }


  checkFields({ name, gender, roles, email }) {
    if (!name || !gender || !roles || !email) {
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
  
  async verifyPassword({ password, user }) {
    const isCorrectPassword = await user.correctPassword(
      password,
      user.password
    );

    if (!isCorrectPassword)
      throw this.createAppError('Contraseña invalida', 401);

    return isCorrectPassword;
  }
  

  async uploadAvatar(file, id, canDelete = false) {
    if(file) {
      const uploadFile = this.fileService.uploadFile();
      const image = await uploadFile.bind(this.fileService, file)();
      try {
       return await this.fileService.saveInDB(
          id,
          this.userRepository,
          image,
          'avatar'
        );
      } catch (error) {
        if(canDelete) {
          await this.userRepository.deleteById(userCreated.id);
        }
        throw error;
      }
    }
  }

  async updateById(id, { name, email, gender}) {

    if (!name || !gender) throw this.createAppError('Todos los campos son obligatorios', 402);

    const userUpdated = await this.userRepository.updateById(id, { name, email, gender });

    if (!userUpdated)
      throw this.createAppError('No se pudo actualizar los datos', 400);

    return userUpdated;
  }

  async updateUserByAdmin(id, { first, last, email, gender, roles, blocked }, file) {

    const name = { first, last };
    this.checkFields({ name, gender, roles,  email });

    await this.uploadAvatar(file, id);

    const userUpdated = await this.userRepository.updateById(id, { name, email, gender, roles, blocked });

    if (!userUpdated)
      throw this.createAppError('No se pudo actualizar los datos', 400);

    return userUpdated;
  }

  
  async create({ first, last, email, gender, roles, blocked, subjects, studentData }, file) {

    const name = { first, last };

    this.checkFields({ name, gender, roles,  email });

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
      roles,
    });

    if (!userCreated)
      throw this.createAppError('No se pudo concluir su registro', 500);

    await this.uploadAvatar(file, userCreated.id, true);

    if(roles.includes('professor')) {
      try {
        await this.professorService.create({userId: userCreated.id, subjects: subjects ?? []});
      } catch (error) {
        await this.userRepository.deleteById(userCreated.id);
        throw error;
      }
    }

    if(roles.includes('student')) {
      try {

        await this.studentService.create({ 
          userId: userCreated.id, studentData: studentData });
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


  async updateUserProfessor(id, { first, last, email, active, gender, subjects }, file) {

    if(!first || !last || !email || !gender || !active) {
      throw this.createAppError('Todos los campos son obligatorios', 400);
    }

    const data = { name: { first, last }, email, gender, active };

    await this.uploadAvatar(file, id, false);

    const userUpdated = await this.userRepository.updateById(id, data);

    if (!userUpdated)
      throw this.createAppError('No se pudo actualizar los datos', 400);

    await this.professorService.updateById(userUpdated.id, { subjects });
    return userUpdated;
  }

  async updateUserStudent(id, { first, last, email, active, gender, studentData }, file) {

    if(!first || !last || !email || !gender || !active) {
      throw this.createAppError('Todos los campos son obligatorios', 400);
    }

    const data = { name: { first, last }, email, gender, active };

    await this.uploadAvatar(file, id, false);

    const userUpdated = await this.userRepository.updateById(id, data);

    if (!userUpdated)
      throw this.createAppError('No se pudo actualizar los datos personales', 400);

    await this.studentService.updateById(userUpdated.id, studentData );
    return userUpdated;

  }


}

module.exports = UserService;
