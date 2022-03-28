// /
const { Router } = require('express');

module.exports = function ({ FileController }) {
  const router = Router();
  router.get('/:folder/:imgName', FileController.getImage);
  return router;
};
