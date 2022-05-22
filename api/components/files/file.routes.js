// /
const { Router } = require('express');

module.exports = function ({ FileController }) {
  const router = Router();
  router.get('/:folder/:imgName', FileController.getImage);
  router.get('/img/:folder/:imgName', FileController.getSubImage);

  return router;
};
