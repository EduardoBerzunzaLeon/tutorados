const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const container = require('../../../api/startup/container');
const Startup = container.resolve('Startup');

Startup.start().catch((err) => {
  console.log(err);
});

chai.use(chaiHttp);
const { app } = container.resolve('App');
const api = chai.request(app);

describe('Users api', () => {
  it('users are returned as json', (done) => {
    api.get('/api/v1/users').end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('array');
      // res.body.length.should.be.eql(0);
      done();
    });
  });
});
