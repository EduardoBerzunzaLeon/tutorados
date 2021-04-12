// api/v1/users
const { Router } = require('express');

module.exports = function ({ UserController, AuthController, AuthMiddleware }) {
  const router = Router();

  router.post('/signup', AuthController.signup);
  router.post('/login', AuthController.login);
  router.get('/logout', AuthController.logout);

  router.post('/forgotPassword', AuthController.forgotPassword);
  router.patch('/resetPassword/:token', AuthController.resetPassword);

  router.use(AuthMiddleware.protect);
  router.use(AuthMiddleware.restrictTo('admin'));

  router.get('/', UserController.getUsers);

  return router;
};
