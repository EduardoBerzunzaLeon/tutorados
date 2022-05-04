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
  router.post('/google', AuthController.googleSignIn);
  router.post('/facebook', AuthController.facebookSignIn);

  router.get('/logout', AuthController.logout);
  router.patch('/activate/:id', AuthController.activate);

  router.post('/forgotPassword', AuthController.forgotPassword);
  router.patch('/resetPassword/:token', AuthController.resetPassword);
  
  router.post('/sendEmailVerify', AuthController.sendEmailVerify);
  router.use(AuthMiddleware.protect);

  router.post('/renew', AuthController.renewToken);
  router.patch('/me/password', AuthController.updatePassword);
  
  router.patch(
    '/avatar',
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'),
    UserController.updateAvatar
    );
    

  router.get('/:id', UserController.findUserById);
  router.patch('/:id', UserController.updateUser);

  router.get('/', AuthMiddleware.restrictTo('admin'), UserController.findUsers);
  router.patch('/:id/admin', 
  [
    AuthMiddleware.restrictTo('admin'),
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'),
  ],
  UserController.updateUserByAdmin);

  
  router.post('/', 
  [
    AuthMiddleware.restrictTo('admin'),
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'),
  ],
  UserController.createUserByAdmin);

  router.patch('/:id/password', AuthMiddleware.restrictTo('admin'), UserController.updatePasswordByAdmin);
  router.patch('/:id/blocked', AuthMiddleware.restrictTo('admin'), UserController.updateBlockedByAdmin);
  // router.get('/', AuthMiddleware.restrictTo('admin'), UserController.getUsers);

  return router;
};
