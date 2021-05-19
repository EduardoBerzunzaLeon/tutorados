const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const container = require('../../../api/startup/container');

const { postAuthentication, credentials } = require('../../start.test');

const { app } = container.resolve('App');
const UserRepository = container.resolve('UserRepository');

chai.use(chaiHttp);
const request = chai.request;

let token;

before(async () => {
  await initializeUsers();
  const { body } = await postAuthentication(credentials);
  token = body.token;
});

const users = [
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

const initializeUsers = async () => {
  await UserRepository.deleteAll();
  for (const user of users) {
    await UserRepository.create(user);
  }
};

describe('Users api', () => {
  describe('Get Users', () => {
    it('users are returned 401 without authetication', (done) => {
      request(app)
        .get('/api/v1/users')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('users are returned data and status 200 with authetication', (done) => {
      request(app)
        .get('/api/v1/users')
        .set({ Authorization: `Bearer ${token}` })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.data.should.be.a('array');
          res.body.status.should.be.eql('success');
          //  Content-Type /application\/json/
          done();
        });
    });
  });
});
