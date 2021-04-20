const jwt = require('jsonwebtoken');

module.exports = ({ config, UserDTO, AuthService, catchAsync }) => {
  const self = {
    config,
    userDTO: UserDTO,
    authService: AuthService,
    catchAsync,
  };

  const signToken = (self) => (id) =>
    jwt.sign({ id }, self.config.SECURITY.JWT_SECRET, {
      expiresIn: self.config.SECURITY.JWT_EXPIRES_IN,
    });

  const createSendToken = (self) => (user, statusCode, req, res) => {
    const token = self.signToken(user._id);

    res.cookie('jwt', token, {
      expires: new Date(
        Date.now() +
          self.config.SECURITY.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    });

    const userSend = self.userDTO.single(users, null);

    return res.status(statusCode).json({
      status: 'success',
      token,
      data: userSend,
    });
  };

  const signup = async (req, res) => {
    const url = `${req.protocol}://${req.get('host')}/me`;
    const user = await self.authService.signup(req.body, url);
    self.createSendToken(user, 201, req, res);
  };

  const login = async (req, res) => {
    const user = await self.authService.login(req.body);
    self.createSendToken(user, 200, req, res);
  };

  const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    return res.status(200).json({ status: 'success' });
  };

  const forgotPassword = async (req, res, next) => {
    const url = `${req.protocol}://${req.get('host')}/api/${
      self.config.API_VERSION
    }/users/resetPassword/`;

    await self.authService.forgotPassword(req.body.email, url);

    return res.status(200).json({
      status: 'success',
      message: 'Token enviado a su correo.',
    });
  };

  const resetPassword = async (req, res) => {
    const user = await self.authService.resetPassword(req.params.token);
    self.createSendToken(user, 200, req, res);
  };

  const updatePassword = async (req, res) => {
    const user = await self.authService.updatePassword(req.user, req.body);
    self.createSendToken(user, 200, req, res);
  };

  const privateMethods = (self) => ({
    signToken: signToken(self),
    createSendToken: createSendToken(self),
  });

  const methods = (self) => ({
    logout,
    login: self.catchAsync(login),
    signup: self.catchAsync(signup),
    forgotPassword: self.catchAsync(forgotPassword),
    resetPassword: self.catchAsync(resetPassword),
    updatePassword: self.catchAsync(updatePassword),
  });

  const authSelf = { ...self, ...privateMethods(self) };

  return methods(authSelf);
};
