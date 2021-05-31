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
const auth = require('../../../../api/components/auth');

chai.use(chaiHttp);
const request = chai.request;

let tokenAdmin;
let userSaved;

describe.only('Auth API', () => {
  before(async () => {
    await initialize(userData);
    const { admin, user } = credentials;

    const [{ body: adminResponse }, { body: userResponse }] = await Promise.all(
      [postAuthentication(admin), postAuthentication(user)]
    );

    tokenAdmin = adminResponse.token;
    userSaved = userResponse;
  });

  describe('Signup Enpoint', () => {
    it('Should returned 400, password is required and password and confirmPassword are different', async () => {
      const userWithPassword = { ...authData.userSignup };
      delete userWithPassword.password;
      const res = await request(app)
        .post('/api/v1/users/signup')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(userWithPassword);

      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal(
        'La contraseña es obligatoria. Las contraseñas no coinciden'
      );
    });

    it('Should returned 401 for user already exists', async () => {
      const res = await request(app)
        .post('/api/v1/users/signup')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(userData[0]);
      expect(res).to.have.status(401);
    });

    it('Should returned 201, create the user with active false and role user for default', async () => {
      const res = await request(app)
        .post('/api/v1/users/signup')
        .send(authData.userSignup);

      const { iat, exp } = await promisify(jwt.verify)(
        res.body.token,
        'rosita-es-la-m4as-perrona-del-lugar-puto-quien-l0-l3a'
      );

      const {
        data: { role, active },
      } = res.body;

      expect(res).to.have.status(201);
      assert.isAbove(exp, iat, 'Expires is greater than date now');
      expect(role).to.equal('user');
      expect(active).to.equal(false);
    });
  });

  describe('Activate Enpoint', () => {
    it('Should returned 401 without authetication', async () => {
      const res = await request(app).patch('/api/v1/users/activate/');

      expect(res).to.have.status(401);
      expect(res.body.error.message).to.equal('Favor de iniciar sesión.');
    });

    it('Should returned 401 with a incorrect ID', async () => {
      const res = await request(app)
        .patch('/api/v1/users/activate/null')
        .set({ Authorization: `Bearer ${userSaved.token}` });

      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal('Invalid _id: null');
    });

    it('Should returned 401 with a ID expired', async () => {
      const res = await request(app)
        .patch('/api/v1/users/activate/60b5231415feb740184088fd')
        .set({ Authorization: `Bearer ${userSaved.token}` });

      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal(
        'No se pudo actualizar el usuario'
      );
    });

    it('Should returned 200, all correct', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/activate/${userSaved.data.id}`)
        .set({ Authorization: `Bearer ${userSaved.token}` });

      expect(res).to.have.status(200);
    });
  });

  describe('Login endpoint', () => {
    // password and email not provided
    it('Should returned 400, not pass email and password', async () => {
      const res = await request(app).post('/api/v1/users/login');

      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal(
        'El usuario y contraseña son obligatorios'
      );
    });
    //  Email correct but active False
    it('Should returned 401, email correct but user not active', async () => {
      const res = await request(app)
        .post('/api/v1/users/login')
        .send(authData.newCredentials);

      expect(res).to.have.status(401);
      expect(res.body.error.message).to.equal('Credenciales incorrectas');
    });
    //  check a email incorrect
    //  Password incorrect
    // Success case
  });
});
