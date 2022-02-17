const container = require('../../api/startup/container');
const UserRepository = container.resolve('UserRepository');

const data = [
  {
    name: {
      first: 'Eduardo Jesús',
      last: 'Berzunza León',
    },
    password: '12345678',
    confirmPassword: '12345678',
    email: 'eduardoberzunzal@gmail.com',
    gender: 'M',
    role: 'admin',
  },
  {
    name: {
      first: 'Cindy',
      last: 'Peña',
    },
    password: '12345678',
    confirmPassword: '12345678',
    email: 'cindy.peña@gmail.com',
    gender: 'F',
    role: 'user',
  },
];

const initialize = async (users) => {
  await UserRepository.deleteAll();
  for (const user of users) {
    await UserRepository.create(user);
  }
};

module.exports = {
  data,
  initialize,
};
