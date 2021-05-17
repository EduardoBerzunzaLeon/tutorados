const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const container = require('../../../api/startup/container');

chai.use(chaiHttp);
const { app } = container.resolve('App');
const Startup = container.resolve('Startup');

const api = chai.request(app);

let server;

before(async () => {
  server = await Startup.start();
});

after(() => server.close());

describe('Users api', () => {
  it('users are returned as json', (done) => {
    api.get('/api/v1/users').end((err, res) => {
      res.should.have.status(200);
      res.body.data.should.be.a('array');
      res.body.status.should.be.eql('success');
      done();
    });
  });
});
