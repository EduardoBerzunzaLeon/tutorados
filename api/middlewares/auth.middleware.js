const { promisify } = require('util');
const jwt = require('jsonwebtoken');

module.exports = ({ catchAsync, UserService, createAppError, config }) => {
  const self = {
    config,
    catchAsync,
    createAppError,
    userService: UserService,
  };

  const protect = async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(self.createAppError('Favor de iniciar sesión.', 401));
    }

    // 2) Verification token
    const { id, iat } = await promisify(jwt.verify)(
      token,
      self.config.SECURITY.JWT_SECRET
    );

    // 3) Check if user still exists
    const currentUser = await self.userService.findActiveUser(id);

    if (!currentUser) {
      return next(self.createAppError('Usuario no encontrado.', 404));
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(iat)) {
      return next(
        self.createAppError(
          'Usuario recientemente cambio de contraseña! Por favor inicia sesión otra vez.',
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  };

  const isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const { id, iat } = await promisify(jwt.verify)(
          req.cookies.jwt,
          self.config.SECURITY.JWT_SECRET
        );

        // 2) Check if user still exists
        const currentUser = await self.userService.findActiveUser(id);
        if (!currentUser) {
          return next(self.createAppError('Usuario no existente.', 404));
        }

        if (!currentUser.active) {
          return next(self.createAppError('Usuario inactivo.', 401));
        }

        // 3) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(iat)) {
          return next(
            self.createAppError(
              'Usuario recientemente cambio de contraseña! Por favor inicia sesión otra vez.',
              401
            )
          );
        }

        // THERE IS A LOGGED IN USER
        res.locals.user = currentUser;
        return next();
      } catch (err) {
        return next();
      }
    }
    next();
  };

  const restrictTo =
    (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          self.createAppError(
            'No tienes permiso para realizar esta acción.',
            403
          )
        );
      }
      next();
    };

  const methods = (self) => ({
    protect: self.catchAsync(protect),
    isLoggedIn: self.catchAsync(isLoggedIn),
    restrictTo,
  });

  return methods(self);
};
