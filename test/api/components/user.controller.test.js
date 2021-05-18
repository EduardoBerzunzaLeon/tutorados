const chai = require('chai');
const chaiHttp = require('chai-http');
const auth = require('../../../api/components/auth');
const should = chai.should();
const container = require('../../../api/startup/container');

chai.use(chaiHttp);
const { app } = container.resolve('App');
const Startup = container.resolve('Startup');

const request = chai.request;

let server;
let token;

before(async () => {
  server = await Startup.start();
  const { body } = await request(app).post('/api/v1/users/login').send({
    email: 'eduardoberzunzal@gmail.com',
    password: '12345678',
  });
  token = body.token;
});

after(() => server.close());

describe('Users api', () => {
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
        done();
      });
  });
});
