// api/v1/users
const { Router } = require('express');

module.exports = function ({
  UserController,
  AuthController,
  AuthMiddleware,
  UploadSingleFile,
}) {
  const router = Router();

  router.post('/signup', AuthController.signup);
  router.post('/login', AuthController.login);
  router.get('/logout', AuthController.logout);
  router.patch('/activate/:id', AuthController.activate);

  router.post('/forgotPassword', AuthController.forgotPassword);
  router.patch('/resetPassword/:token', AuthController.resetPassword);

  router.use(AuthMiddleware.protect);

  router.post('/me/password', AuthController.updatePassword);
  // router.use(AuthMiddleware.restrictTo('admin'));

  router.get('/', AuthMiddleware.restrictTo('admin'), UserController.getUsers);
  // router.get('/', UserController.getUsers);
  router.patch(
    '/avatar',
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'),
    UserController.updateAvatar
  );

  return router;
};
