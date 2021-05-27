const { promisify } = require('util');

const chai = require('chai');
const chaiHttp = require('chai-http');
const { assert, expect } = require('chai');
const jwt = require('jsonwebtoken');

const container = require('../../../../api/startup/container');
const { app } = container.resolve('App');
const { postAuthentication, credentials } = require('../../../start.test');
const { data: authData } = require('../../../initialization/auth');
const { initialize, data: userData } = require('../../../initialization/user');

chai.use(chaiHttp);
const request = chai.request;

let tokenAdmin;
let tokenUser;

before(async () => {
  await initialize(userData);
  const { admin, user } = credentials;

  const [{ body: adminResponse }, { body: userResponse }] = await Promise.all([
    postAuthentication(admin),
    postAuthentication(user),
  ]);

  tokenAdmin = adminResponse.token;
  tokenUser = userResponse.token;
});

describe.only('Auth API', () => {
  describe('Signup', () => {
    it('Should returned 201 and create the user', async () => {
      const res = await request(app)
        .post('/api/v1/users/signup')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(authData.userSignup);

      // TODO: Implements check de fechas..!!
      const { iat, exp } = await promisify(jwt.verify)(
        res.body.token,
        'rosita-es-la-m4as-perrona-del-lugar-puto-quien-l0-l3a'
      );

      console.log(resve);
      expect(res).to.have.status(201);
    });
  });
});
// {
//     status: 'success',
//     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwYWZkNjNlYzk0OWMxMzdmMGM4MjUyZiIsImlhdCI6MTYyMjEzNjM4NCwiZXhwIjoxNjI5OTEyMzg0fQ.Cbpoike1zydak5X_qvDxXrhBQVQTsPJwPZuJsyvZA_0',
//     data: {
//       id: '60afd63ec949c137f0c8252f',
//       name: { first: 'Heriberto Ramon', last: 'Uc Cosgaya' },
//       fullname: 'Heriberto Ramon Uc Cosgaya',
//       gender: 'M',
//       email: 'heriberto.ramon@gmail.com',
//       active: false,
//       role: 'user'
//     }
//   }
