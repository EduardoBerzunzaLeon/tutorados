const jwt = require('jsonwebtoken');

class AuthMiddleware {
  constructor({ catchAsync, userService, createAppError, config }) {
    this.catchAsync = catchAsync;
    this.userService = userService;
    this.createAppError = createAppError;
    this.config = config;
  }

  protect = this.catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        this.createAppError(
          'You are not logged in! Please log in to get access.',
          401
        )
      );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(
      token,
      this.config.security.JWT_SECRET
    );

    // 3) Check if user still exists
    const currentUser = await userService.findById(decoded.id);
    if (!currentUser) {
      return next(
        this.createAppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        this.createAppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  });

  isLoggedIn = this.catchAsync(async (req, res, next) => {
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          this.config.security.JWT_SECRET
        );

        // 2) Check if user still exists
        const currentUser = await userService.findById(decoded.id);
        if (!currentUser) {
          return next();
        }

        // 3) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
          return next();
        }

        // THERE IS A LOGGED IN USER
        res.locals.user = currentUser;
        return next();
      } catch (err) {
        return next();
      }
    }
    next();
  });

  restrictTo = (...roles) => (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        this.createAppError(
          'You do not have permission to perform this action',
          403
        )
      );
    }
    next();
  };
}

module.exports = AuthMiddleware;
