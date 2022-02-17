const handlerErrorNotFoundResource = (req, res, next) => {
  next({ name: 'NotFoundResourceError' });
};

module.exports = handlerErrorNotFoundResource;
