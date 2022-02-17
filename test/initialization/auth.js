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

const tokens = {
  googleToken:
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImFkZDhjMGVlNjIzOTU0NGFmNTNmOTM3MTJhNTdiMmUyNmY5NDMzNTIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNDcwODUyNjMzNTUzLXRsdW5ianVnOTVxbzNlb2RydXM1a2Y0OWkwZTFvazcxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNDcwODUyNjMzNTUzLXRsdW5ianVnOTVxbzNlb2RydXM1a2Y0OWkwZTFvazcxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA5NjYwMDcwNDg4MDc2Mjc2NjI5IiwiZW1haWwiOiJlZHVhcmRvYmVyenVuemFsQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiaTI0LXkwdDVDS2xwQjJFUUgwU0xXUSIsIm5hbWUiOiJFZHVhcmRvIEplc8O6cyBCZXJ6dW56YSBMZcOzbiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHZ0NUSW1KVVNQWDQ4QkFIcmV0YWt0dHRIY3EtZ2FuZ0VLQmJvd2E9czk2LWMiLCJnaXZlbl9uYW1lIjoiRWR1YXJkbyBKZXPDunMiLCJmYW1pbHlfbmFtZSI6IkJlcnp1bnphIExlw7NuIiwibG9jYWxlIjoiZXMtNDE5IiwiaWF0IjoxNjM0MjY4MDk4LCJleHAiOjE2MzQyNzE2OTgsImp0aSI6ImI2MjkwN2IwNWI1M2NjM2EwZTIxZjhhZDEzNGE0ODBmMWMzZThlZGMifQ.iPe3w88-pFvd_Zdxhqd_IZvaMMHX1o6uElnXgrHnWZjzL9-GLJIzaW7_YeLoMA6dlV9OvRbooS9eTM4FJN55eCbSiI2w9zQ6JB65yDm8uGWk0-GxWWOZWdEJWcj5nTHELm-l1UILkxSN01cAvn3SSrJJ9iqVLmXLL6eHor5An_t_23Fc6hhh5hMKTjTqQwucmBSCdhwPcK5YG-8r00yQdl_VQtYvWSe661W4j1vAQ1H9rbrosHx2Ggua3MlP24z9dhAAzPbIiucYkfMgzjvNYjQvnYc6lVBB15mID88tiEHwcIW5q64MpNlHb2g5plaoXp1T5d-9weCiKCz6pKJrtQ',
  facebookToken:
    'EAARANwe9sdMBAGLOYKqJ0C8xbDg19oOUBlXAQDoGENYLVI8GhfGZBDJ2KGOY9n1kNRRvl3RcHXErFHpNY94rXeQfLCjzqxcHoJIHLq27oPrA2ESgWboc9YTze49ID1SKs4QigceqHAIAZCFnZBpH7CAZCAQIzOIZCIN4mLsqY11ZC1Hg8ZCw9WX8wscpHvYIbl0YoxAZADmvdAZDZD',
};

const postAuthentication = async (user) =>
  await request(app).post('/api/v1/users/login').send(user);

const data = {
  userSignup,
  credentials,
  tokens,
};

const initialize = async () => {
  await UserRepository.deleteAll();
};

module.exports = {
  data,
  initialize,
  postAuthentication,
};
