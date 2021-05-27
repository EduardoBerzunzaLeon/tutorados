const container = require('../../api/startup/container');
const UserRepository = container.resolve('UserRepository');

const userSignup = {
  name: {
    first: 'Heriberto Ramon',
    last: 'Uc Cosgaya',
  },
  password: '12345678',
  confirmPassword: '12345678',
  email: 'heriberto.ramon@gmail.com',
  gender: 'M',
};

const newCredentials = {
  email: 'heriberto.ramon@gmail.com',
  password: '12345678',
};

const data = {
  userSignup,
  newCredentials,
};

const initialize = async () => {
  await UserRepository.deleteAll();
};

module.exports = {
  data,
  initialize,
};
