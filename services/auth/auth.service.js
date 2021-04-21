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
  }

  async signup({ name, email, password, confirmPassword, gender }, url) {
    const userExists = await this.userRepository.findOne({ name });

    if (userExists) throw this.createAppError('Usuario ya existe', 401);

    const userCreated = await this.userRepository.create({
      name,
      email,
      password,
      confirmPassword,
      gender,
      active: false,
    });

    if (!userCreated)
      throw this.createAppError('No se pudo concluir su registro', 500);

    const urlWithId = `${url}${userCreated._id}`;

    try {
      // TODO: Implements emailService
      await this.emailService.createEmail(userCreated).sendWelcome(urlWithId);
      return userCreated;
    } catch (error) {
      console.log(error);
      throw this.createAppError(
        'Ocurrio un error al enviar el correo. Intentelo más tarde.',
        500
      );
    }
  }

  async activate({ id }) {
    if (!id) throw this.createAppError('Ruta no valida', 401);
    return await this.userRepository.updateById(id, { active: true });
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

  async forgotPassword(email, url) {
    const user = await this.userRepository.findOne({ email });
    if (!user) throw this.createAppError('Correo no existente', 404);

    const resetToken = user.createPasswordResetToken();
    const resetURL = `${url}${resetToken}`;
    await this.userRepository.save(user, { validateBeforeSave: false });

    try {
      // TODO: Implements emailService
      await this.emailService.createEmail(user).sendPasswordReset(resetURL);
      return true;
    } catch (error) {
      console.log(error);
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
    const hashedToken = generateHashedToken(token);

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

    if (!(await user.correctPassword(currentPassword, user.password))) {
      throw this.createAppError('Contraseña invalida.', 500);
    }

    user.password = password;
    user.confirmPassword = confirmPassword;

    await this.userRepository.save(user);

    return user;
  }
}

module.exports = AuthService;
