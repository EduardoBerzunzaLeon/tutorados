class AuthService {
  constructor({ EmailService, UserRepository, createAppError }) {
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

    return userCreated;
    // try {
    //   // TODO: Implements emailService
    //   await this.emailService.createEmail(user).sendWelcome(url);
    //   return userCreated;
    // } catch (error) {
    //   throw this.createAppError(
    //     'Ocurrio un error al enviar el correo. Intentelo más tarde.',
    //     500
    //   );
    // }
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
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await this.userRepository.save(user, { validateBeforeSave: false });

      throw this.createAppError(
        'Ocurrio un error al enviar el correo. Intentelo más tarde.',
        500
      );
    }
  }

  async resetPassword(token) {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = this.userRepository.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      throw this.createAppError('Token invalido o ha expirado.', 500);
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await this.userRepository.save(user);

    return user;
  }

  async updatePassword(id, { password, passwordConfirm, passwordCurrent }) {
    const user = await this.userRepository.findById(id);

    if (!(await user.correctPassword(passwordCurrent, user.password))) {
      throw this.createAppError('Contraseña invalida.', 500);
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await this.userRepository.save(user);

    return user;
  }
}

module.exports = AuthService;
