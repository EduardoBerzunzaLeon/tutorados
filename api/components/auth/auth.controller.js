const jwt = require('jsonwebtoken');

let catchAsyncMethod;

class AuthController {
  constructor({ config, UserDTO, AuthService, catchAsync }) {
    this.config = config;
    this.userDTO = UserDTO;
    catchAsyncMethod = catchAsync;
    this.authService = AuthService;
  }

  signToken(id) {
    return jwt.sign({ id }, this.config.SECURITY.JWT_SECRET, {
      expiresIn: this.config.SECURITY.JWT_EXPIRES_IN,
    });
  }

  createSendToken(user, statusCode, req, res) {
    const token = this.signToken(user._id);

    res.cookie('jwt', token, {
      expires: new Date(
        Date.now() +
          this.config.SECURITY.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    });

    const userSend = this.userDTO.single(users, null);

    return res.status(statusCode).json({
      status: 'success',
      token,
      data: userSend,
    });
  }

  // catch
  async signup(req, res) {
    const url = `${req.protocol}://${req.get('host')}/me`;
    const user = await this.authService.signup(req.body, url);
    this.createSendToken(user, 201, req, res);
  }

  // catch
  async login(req, res) {
    const user = await this.authService.login(req.body);
    this.createSendToken(user, 200, req, res);
  }

  logout(req, res) {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
  }

  // Password Actions catch
  async forgotPassword(req, res, next) {
    const url = `${req.protocol}://${req.get('host')}/api/${
      this.config.API_VERSION
    }/users/resetPassword/`;

    await this.authService.forgotPassword(req.body.email, url);

    return res.status(200).json({
      status: 'success',
      message: 'Token enviado a su correo.',
    });
  }

  // catch
  async resetPassword(req, res) {
    const user = await this.authService.resetPassword(req.params.token);
    this.createSendToken(user, 200, req, res);
  }

  // catch
  async updatePassword(req, res) {
    const user = await this.authService.updatePassword(req.user, req.body);
    this.createSendToken(user, 200, req, res);
  }
}

module.exports = AuthController;
