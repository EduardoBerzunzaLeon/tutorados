// api/v1/users

const { Router } = require('express');

module.exports = function ({ UserController }) {
  const router = Router();
  router.get('/', UserController.getUsers);
  return router;
};
