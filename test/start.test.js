const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const container = require('../api/startup/container');

const { app } = container.resolve('App');
const Startup = container.resolve('Startup');

chai.use(chaiHttp);
const request = chai.request;

let server;

const credentials = {
  email: 'eduardoberzunzal@gmail.com',
  password: '12345678',
};

const postAuthentication = async (credentials) =>
  await request(app).post('/api/v1/users/login').send(credentials);

before(async () => {
  server = await Startup.start();
});

after(() => {
  server.close();
  mongoose.connection.close();
});

module.exports = {
  postAuthentication,
  credentials,
};
