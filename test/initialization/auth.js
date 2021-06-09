const chai = require('chai');
const chaiHttp = require('chai-http');
const container = require('../../api/startup/container');
const UserRepository = container.resolve('UserRepository');
const { app } = container.resolve('App');

chai.use(chaiHttp);
const request = chai.request;

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

const credentials = {
  admin: {
    email: 'eduardoberzunzal@gmail.com',
    password: '12345678',
  },
  user: {
    email: 'cindy.peña@gmail.com',
    password: '12345678',
  },
  newUser: {
    email: 'heriberto.ramon@gmail.com',
    password: '12345678',
  },
};

const postAuthentication = async (user) =>
  await request(app).post('/api/v1/users/login').send(user);

const data = {
  userSignup,
  credentials,
};

const initialize = async () => {
  await UserRepository.deleteAll();
};

module.exports = {
  data,
  initialize,
  postAuthentication,
};
