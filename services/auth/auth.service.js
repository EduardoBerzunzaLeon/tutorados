class AuthService {
  constructor({
    EmailService,
    UserRepository,
    createAppError,
    generateHashedToken,
  }) {
    this.emailService = EmailService;
    this.userRepository = UserRepository;
    this.createAppError = createAppError;
    this.generateHashedToken = generateHashedToken;
  }

  async signup({ name, email, password, confirmPassword, gender }, url) {
    const userExists = await this.userRepository.findOne({ email });

    if (userExists) throw this.createAppError('Usuario ya existe', 401);

    const userCreated = await this.userRepository.create({
      name,
      email,
      password,
      confirmPassword,
      gender,
      active: false,
      role: 'user',
    });

    if (!userCreated)
      throw this.createAppError('No se pudo concluir su registro', 500);

    const urlWithId = `${url}${userCreated._id}`;

    try {
      await this.emailService.createEmail(userCreated).sendWelcome(urlWithId);
      return userCreated;
    } catch (error) {
      throw this.createAppError(
        'Ocurrio un error al enviar el correo. Intentelo más tarde.',
        500
      );
    }
  }

  async activate({ id }) {
    if (!id) throw this.createAppError('El id es requerido', 401);
    const userUpdated = await this.userRepository.updateById(id, {
      active: true,
    });

    if (!userUpdated) {
      throw this.createAppError('No se pudo actualizar el usuario', 400);
    }

    return userUpdated;
  }

  async login({ email, password }) {
    if (!email || !password)
      throw this.createAppError(
        'El usuario y contraseña son obligatorios',
        400
      );

    const user = await this.userRepository.findOne({
      email,
      active: true,
    });

    if (!user) throw this.createAppError('Credenciales incorrectas', 401);

    const isCorrectPassword = await user.correctPassword(
      password,
      user.password
    );

    if (!isCorrectPassword)
      throw this.createAppError('Credenciales incorrectas', 401);

    return user;
  }

  async forgotPassword({ email }, url) {
    if (!email) throw this.createAppError('Correo es requerido', 400);

    const user = await this.userRepository.findOne({ email });

    if (!user) throw this.createAppError('Correo no existente', 404);

    const resetToken = user.createPasswordResetToken();
    const resetURL = `${url}${resetToken}`;
    await this.userRepository.save(user, {
      validateBeforeSave: false,
    });

    try {
      await this.emailService.createEmail(user).sendPasswordReset(resetURL);
      return resetURL;
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await this.userRepository.save(user, { validateBeforeSave: false });

      throw this.createAppError(
        'Ocurrio un error al enviar el correo. Intentelo más tarde.',
        500
      );
    }
  }

  async resetPassword(token, { password, confirmPassword }) {
    // 1) Get user based on the token
    const hashedToken = this.generateHashedToken(token);

    const user = await this.userRepository.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      throw this.createAppError('Token invalido o ha expirado.', 500);
    }

    user.password = password;
    user.confirmPassword = confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await this.userRepository.save(user);

    return user;
  }

  async updatePassword(id, { password, confirmPassword, currentPassword }) {
    const user = await this.userRepository.findById(id);

    console.log(user);
    if (!(await user.correctPassword(currentPassword, user.password))) {
      throw this.createAppError('Contraseña invalida.', 400);
    }

    user.password = password;
    user.confirmPassword = confirmPassword;

    await this.userRepository.save(user);

    return user;
  }
}

module.exports = AuthService;
