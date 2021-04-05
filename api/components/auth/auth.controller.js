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
    const user = await this.authService.signup(req.body);
    this.createSendToken(user, 201, req, res);
  });

  login = this.catchAsync(async (req, res) => {
    // const { email, password } = req.body;

    // // 1) Check if email and password exist
    // if (!email || !password) {
    //   return next(
    //     this.createAppError('Please provide email and password!', 400)
    //   );
    // }

    // 2) Check if user exists && password is correct
    const user = await this.authService.login(req.body);

    // if (!user || !(await user.correctPassword(password, user.password))) {
    //   return next(this.createAppError('Incorrect email or password', 401));
    // }

    // 3) If everything ok, send token to client
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
    // 1) Get user based on POSTed email
    await this.authService.forgotPassword(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });

    // if (!user) {
    //   return next(
    //     this.createAppError('There is no user with email address.', 404)
    //   );
    // }

    // 2) Generate the random reset token
    // const resetToken = user.createPasswordResetToken();
    // await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    // try {
    //   //   const resetURL = `${req.protocol}://${req.get(
    //   //     'host'
    //   //   )}/api/v1/users/resetPassword/${resetToken}`;
    //   //   await new Email(user, resetURL).sendPasswordReset();

    //   res.status(200).json({
    //     status: 'success',
    //     message: 'Token sent to email!',
    //   });
    // } catch (err) {
    //   user.passwordResetToken = undefined;
    //   user.passwordResetExpires = undefined;
    //   // TODO: Implements save method
    //   await this.userService.save({ validateBeforeSave: false });

    //   return next(
    //     this.createAppError(
    //       'There was an error sending the email. Try again later!'
    //     ),
    //     500
    //   );
    // }
  });

  resetPassword = this.catchAsync(async (req, res) => {
    // 1) Get user based on the token
    // const hashedToken = crypto
    //   .createHash('sha256')
    //   .update(req.params.token)
    //   .digest('hex');

    const user = await this.authService.resetPassword(req.params.token);
    this.createSendToken(user, 200, req, res);

    // // 2) If token has not expired, and there is user, set the new password
    // if (!user) {
    //   return next(this.createAppError('Token is invalid or has expired', 400));
    // }
    // user.password = req.body.password;
    // user.passwordConfirm = req.body.passwordConfirm;
    // user.passwordResetToken = undefined;
    // user.passwordResetExpires = undefined;
    // await this.userService.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
  });

  updatePassword = this.catchAsync(async (req, res) => {
    // 1) Get user from collection
    const user = await this.authService.updatePassword(req.user);
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
