class AuthService {
  constructor({ EmailService, UserRepository, createAppError }) {
    this._emailService = EmailService;
    this._userRepository = UserRepository;
    this.createAppError = createAppError;
  }

  async signup({ name, email, password, confirmPassword }, url) {
    const userExists = await this._userRepository.findOne({ name });

    if (userExists) throw createAppError('Usuario ya existe', 401);

    const userCreated = await this._userRepository.create({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!userCreated)
      throw createAppError('No se pudo concluir su registro', 500);

    try {
      // TODO: Implements emailService
      await this._emailService.createEmail(user).sendWelcome(url);
      return userCreated;
    } catch (error) {
      throw createAppError(
        'Ocurrio un error al enviar el correo. Intentelo más tarde.',
        500
      );
    }
  }

  async login({ email, password }) {
    if (!email || !password)
      throw createAppError('El usuario y contraseña son obligatorios', 400);

    const user = await this._userRepository.findOne({
      email,
      password,
      active: true,
    });

    if (!user) throw createAppError('Credenciales incorrectas', 401);

    return user;
  }

  async forgotPassword(email, url) {
    const user = await this._userRepository.findOne({ email });
    if (user) throw createAppError('Correo no existente', 404);

    const resetToken = user.createPasswordResetToken();
    const resetURL = `${url}${resetToken}`;
    await this._userRepository.save(user);

    try {
      // TODO: Implements emailService
      await this._emailService.createEmail(user).sendPasswordReset(resetURL);
      return true;
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await this._userRepository.save(user);

      throw createAppError(
        'Ocurrio un error al enviar el correo. Intentelo más tarde.',
        500
      );
    }
  }

  async resetPassword(token) {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = this._userRepository.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      throw createAppError('Token invalido o ha expirado.', 500);
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await this._userRepository.save(user);
  }

  async updatePassword(id, { password, passwordConfirm, passwordCurrent }) {
    const user = await this._userRepository.findById(id);

    if (!(await user.correctPassword(passwordCurrent, user.password))) {
      throw createAppError('Contraseña invalida.', 500);
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await this._userRepository.save(user);

    return user;
  }
}

module.exports = AuthService;
