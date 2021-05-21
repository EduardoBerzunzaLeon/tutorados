const chai = require('chai');
const chaiHttp = require('chai-http');
const { assert, expect } = require('chai');

const container = require('../../../api/startup/container');
const { app } = container.resolve('App');

const { postAuthentication, credentials } = require('../../start.test');
const { initialize, data } = require('../../initialization/user');

chai.use(chaiHttp);
const request = chai.request;

let tokenAdmin;
let tokenUser;

before(async () => {
  await initialize(data);
  const { admin, user } = credentials;

  const [{ body: adminResponse }, { body: userResponse }] = await Promise.all([
    postAuthentication(admin),
    postAuthentication(user),
  ]);

  tokenAdmin = adminResponse.token;
  tokenUser = userResponse.token;
});

describe('Users api', () => {
  describe('Get Users', () => {
    it('users are returned 401 without authetication', (done) => {
      request(app)
        .get('/api/v1/users')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('users are returned 403 with user role', (done) => {
      request(app)
        .get('/api/v1/users')
        .set({ Authorization: `Bearer ${tokenUser}` })
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });

    it('users are returned data and status 200 with authetication', (done) => {
      request(app)
        .get('/api/v1/users')
        .set({ Authorization: `Bearer ${tokenAdmin}` })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          assert.isArray(res.body.data, 'Its array');
          assert.equal(res.body.status, 'success', 'All is right');
          done();
        });
    });

    it('Returned two records: one contains "Eduardo Jesus Berzunza Leon" and no one contain password', (done) => {
      request(app)
        .get('/api/v1/users')
        .set({ Authorization: `Bearer ${tokenAdmin}` })
        .end((err, res) => {
          const {
            body: { data: users },
          } = res;

          const findUser = users.find(
            ({ fullname }) => fullname === 'Eduardo Jesús Berzunza León'
          );
          const findPassword = users.find((u) => u['password'] !== undefined);

          assert.isUndefined(findPassword, 'Not returned the password field');
          assert.isObject(findUser, 'Not returned the password field');

          done();
        });
    });
  });
});
