const jwt = require('jsonwebtoken');

module.exports = ({ config, UserDTO, AuthService, catchAsync }) => {
  const self = {
    config,
    userDTO: UserDTO,
    authService: AuthService,
    catchAsync,
  };

  const canSignToken = (self) => ({
    signToken: (id) =>
      jwt.sign({ id }, self.config.SECURITY.JWT_SECRET, {
        expiresIn: self.config.SECURITY.JWT_EXPIRES_IN,
      }),
  });

  const canCreateSendToken = (self) => ({
    createSendToken: (user, statusCode, req, res, withUser = true) => {
      const token = self.signToken(user._id);
      res.cookie('jwt', token, {
        expires: new Date(
          Date.now() +
            self.config.SECURITY.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      });

      if (withUser) {
        const userSend = self.userDTO.single(user, null);
        return res.status(statusCode).json({
          status: 'success',
          token,
          data: userSend,
        });
      }

      return res.status(statusCode).json({
        status: 'success',
        token,
      });
    },
  });

  const signup = (self) => async (req, res) => {
    const url = `${req.protocol}://${req.get('host')}/api/${
      self.config.API_VERSION
    }/users/activate/`;
    const user = await self.authService.signup(req.body, url);

    self.createSendToken(user, 201, req, res, false);
  };

  const activate = (self) => async (req, res) => {
    await self.authService.activate(req.params);
    return res.status(200).json({
      status: 'success',
      message: 'Cuenta activada.',
    });
  };

  const login = (self) => async (req, res) => {
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

  const forgotPassword = (self) => async (req, res, next) => {
    const url = `${req.protocol}://${req.get('host')}/api/${
      self.config.API_VERSION
    }/users/resetPassword/`;

    const resetUrl = await self.authService.forgotPassword(req.body, url);

    return res.status(200).json({
      status: 'success',
      message: 'Token enviado a su correo.',
      data: {
        resetUrl,
      },
    });
  };

  const resetPassword = (self) => async (req, res) => {
    const user = await self.authService.resetPassword(
      req.params.token,
      req.body
    );
    self.createSendToken(user, 200, req, res);
  };

  const updatePassword = (self) => async (req, res) => {
    const user = await self.authService.updatePassword(req.user, req.body);
    self.createSendToken(user, 200, req, res);
  };

  const renewToken = (self) => async (req, res) => {
    self.createSendToken(req.user, 200, req, res);
  };

  const methods = (self) => ({
    logout,
    login: self.catchAsync(login(self)),
    signup: self.catchAsync(signup(self)),
    activate: self.catchAsync(activate(self)),
    forgotPassword: self.catchAsync(forgotPassword(self)),
    resetPassword: self.catchAsync(resetPassword(self)),
    updatePassword: self.catchAsync(updatePassword(self)),
    renewToken: self.catchAsync(renewToken(self)),
  });

  Object.assign(self, canSignToken(self), canCreateSendToken(self));

  return methods(self);
};
