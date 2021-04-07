const jwt = require('jsonwebtoken');

class AuthController {
  constructor({ config, UserDTO, AuthService, catchAsync }) {
    this.config = config;
    this.userDTO = UserDTO;
    this.catchAsync = catchAsync;
    this.authService = AuthService;
  }

  signToken = (id) =>
    jwt.sign({ id }, this.config.security.JWT_SECRET, {
      expiresIn: this.config.security.JWT_EXPIRES_IN,
    });

  createSendToken = (user, statusCode, req, res) => {
    const token = this.signToken(user._id);

    res.cookie('jwt', token, {
      expires: new Date(
        Date.now() +
          this.config.security.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    });

    const userSend = this.userDTO.single(users, null);

    res.status(statusCode).json({
      status: 'success',
      token,
      data: userSend,
    });
  };

  signup = this.catchAsync(async (req, res) => {
    const url = `${req.protocol}://${req.get('host')}/me`;
    const user = await this.authService.signup(req.body, url);
    this.createSendToken(user, 201, req, res);
  });

  login = this.catchAsync(async (req, res) => {
    const user = await this.authService.login(req.body);
    this.createSendToken(user, 200, req, res);
  });

  logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
  };

  // Password Actions
  forgotPassword = this.catchAsync(async (req, res, next) => {
    const url = `${req.protocol}://${req.get('host')}/api/${
      this.config.API_VERSION
    }/users/resetPassword/`;

    await this.authService.forgotPassword(req.body.email, url);

    return res.status(200).json({
      status: 'success',
      message: 'Token enviado a su correo.',
    });
  });

  resetPassword = this.catchAsync(async (req, res) => {
    const user = await this.authService.resetPassword(req.params.token);
    this.createSendToken(user, 200, req, res);
  });

  updatePassword = this.catchAsync(async (req, res) => {
    // 1) Get user from collection
    const user = await this.authService.updatePassword(req.user, req.body);
    this.createSendToken(user, 200, req, res);
    // 2) Check if POSTed current password is correct
    // if (
    //   !(await user.correctPassword(req.body.passwordCurrent, user.password))
    // ) {
    //   return next(this.createAppError('Your current password is wrong.', 401));
    // }

    // // 3) If so, update password
    // user.password = req.body.password;
    // user.passwordConfirm = req.body.passwordConfirm;
    // await this.userService.save();
    // User.findByIdAndUpdate will NOT work as intended!

    // 4) Log user in, send JWT
  });
}

module.exports = AuthController;
