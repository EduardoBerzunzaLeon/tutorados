module.exports = (size) => {
  const seed =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_()-';
  let randomString = '';

  for (let index = 0; index < size; index++) {
    randomString += seed.charAt(Math.floor(Math.random() * seed.length));
  }

  return randomString;
};
