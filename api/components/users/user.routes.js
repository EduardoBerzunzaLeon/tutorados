// api/v1/users
const { Router } = require('express');

module.exports = function ({
  UserController,
  AuthController,
  AuthMiddleware,
  UploadSingleFile,
  config
}) {
  const router = Router();
  const {
    get_users,
    delete_users,
    update_users,
    create_users
   } = config.PERMISSIONS_LIST.user;
   
   const { restrictTo, protect } = AuthMiddleware;

  router.post('/signup', AuthController.signup);
  router.post('/login', AuthController.login);
  router.post('/google', AuthController.googleSignIn);
  router.post('/facebook', AuthController.facebookSignIn);

  router.get('/logout', AuthController.logout);
  router.patch('/activate/:id', AuthController.activate);

  router.post('/forgotPassword', AuthController.forgotPassword);
  router.patch('/resetPassword/:token', AuthController.resetPassword);
  
  router.post('/sendEmailVerify', AuthController.sendEmailVerify);

  router.use(protect);

  router.post('/renew', AuthController.renewToken);
  router.patch('/me/password', AuthController.updatePassword);
  router.patch(
    '/avatar',
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'),
    UserController.updateAvatar
    );
    

  router.get('/:id', restrictTo(get_users), UserController.findUserById);
  router.patch('/:id', restrictTo(update_users), UserController.updateUser);

  router.get('/', restrictTo(get_users), UserController.findUsers);
  router.patch('/:id/admin', 
  [
    restrictTo(update_users),
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'),
  ],
  UserController.updateUserByAdmin);

  router.post('/', 
  [
    restrictTo(create_users),
    UploadSingleFile(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '2000', 'avatar'),
  ],
  UserController.createUserByAdmin);

  router.patch('/:id/password', restrictTo(update_users), UserController.updatePasswordByAdmin);
  router.patch('/:id/blocked', restrictTo(delete_users), UserController.updateBlockedByAdmin);
  // router.get('/', AuthMiddleware.restrictTo('admin'), UserController.getUsers);

  return router;
};
