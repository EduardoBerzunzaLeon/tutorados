const { promisify } = require('util');

const chai = require('chai');
const chaiHttp = require('chai-http');
const { assert, expect } = require('chai');
const jwt = require('jsonwebtoken');

const container = require('../../../../api/startup/container');
const { app } = container.resolve('App');
const UserRepository = container.resolve('UserRepository');
const {
  SECURITY: { JWT_SECRET },
  PATH_ENDPOINT,
} = container.resolve('config');

const {
  data: authData,
  postAuthentication,
} = require('../../../initialization/auth');
const { initialize, data: userData } = require('../../../initialization/user');

chai.use(chaiHttp);
const request = chai.request;

describe('Auth API', () => {
  const { admin, user, newUser } = authData.credentials;
  const errorEmail = 'notexistemail@gmail.com';
  const urlEndpoint = `${PATH_ENDPOINT}/users`;
  let tokenAdmin;
  let userSaved;

  before(async () => {
    await initialize(userData);

    const [{ body: adminResponse }, { body: userResponse }] = await Promise.all(
      [postAuthentication(admin), postAuthentication(user)]
    );

    tokenAdmin = adminResponse.token;
    userSaved = userResponse;
  });

  describe('Signup Enpoint', () => {
    it('Should return 400, email incorrect structure, password is required and password and confirmPassword are different', async () => {
      const userWithPassword = { ...authData.userSignup };
      delete userWithPassword.password;
      userWithPassword.email = 'thisisnotacorrectemail';
      const res = await request(app)
        .post(`${urlEndpoint}/signup`)
        .send(userWithPassword);

      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal(
        'Porfavor ingresa un correo valido. La contraseña es obligatoria. Las contraseñas no coinciden'
      );
    });

    it('Should return 401 for user already exists', async () => {
      const res = await request(app)
        .post(`${urlEndpoint}/signup`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(userData[0]);
      expect(res).to.have.status(401);
    });

    it('Should return 201, create the user with active false and role user for default', async () => {
      const res = await request(app)
        .post(`${urlEndpoint}/signup`)
        .send(authData.userSignup);

      const { iat, exp } = await promisify(jwt.verify)(
        res.body.token,
        JWT_SECRET
      );

      const { status } = res.body;

      expect(res).to.have.status(201);
      expect(status).to.equal('success');
      assert.property(res.body, 'token');
      assert.isAbove(exp, iat, 'Expires is greater than date now');
    });
  });

  describe('Google Signin Enpoint', () => {
    it('Should return 400, token id is required', async () => {
      const res = await request(app).post(`${urlEndpoint}/google`);
      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal('El ID TOKEN es requerido');
    });

    it('Should return 400, expired token', async () => {
      const res = await request(app).post(`${urlEndpoint}/google`).send({
        tokenId: authData.tokens.googleToken,
      });
      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal('El Token no se pudo verificar.');
    });

    it('Should return 400, incorrect token', async () => {
      const res = await request(app)
        .post(`${urlEndpoint}/google`)
        .send({ tokenId: 'incorrectToken' });
      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal('El Token no se pudo verificar.');
    });
  });

  describe('Facebook Signin Enpoint', () => {
    it('Should return 400, token id is required', async () => {
      const res = await request(app).post(`${urlEndpoint}/facebook`);
      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal('El ID TOKEN es requerido');
    });

    it('Should return 400, expired token', async () => {
      const res = await request(app).post(`${urlEndpoint}/facebook`).send({
        tokenId: authData.tokens.facebookToken,
      });
      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal('El Token no se pudo verificar.');
    });

    it('Should return 400, incorrect token', async () => {
      const res = await request(app)
        .post(`${urlEndpoint}/facebook`)
        .send({ tokenId: 'incorrectToken' });
      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal('El Token no se pudo verificar.');
    });
  });

  describe('Activate Enpoint', () => {
    it('Should return 401 without authetication', async () => {
      const res = await request(app).patch(`${urlEndpoint}/activate`);

      expect(res).to.have.status(401);
      expect(res.body.error.message).to.equal('Favor de iniciar sesión.');
    });

    it('Should return 401 with a incorrect ID', async () => {
      const res = await request(app)
        .patch(`${urlEndpoint}/activate/null`)
        .set({ Authorization: `Bearer ${userSaved.token}` });

      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal('Invalid _id: null');
    });

    it('Should return 401 with a ID expired', async () => {
      const res = await request(app)
        .patch(`${urlEndpoint}/activate/60b5231415feb740184088fd`)
        .set({ Authorization: `Bearer ${userSaved.token}` });

      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal(
        'No se pudo actualizar el usuario'
      );
    });

    it('Should return 200, all correct', async () => {
      const res = await request(app)
        .patch(`${urlEndpoint}/activate/${userSaved.data.id}`)
        .set({ Authorization: `Bearer ${userSaved.token}` });

      expect(res).to.have.status(200);
    });
  });

  describe('Login endpoint', () => {
    it('Should return 400, not provided email and password', async () => {
      const res = await request(app).post(`${urlEndpoint}/login`);

      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal(
        'El usuario y contraseña son obligatorios'
      );
    });

    it('Should return 401, email correct but user not active', async () => {
      const res = await request(app).post(`${urlEndpoint}/login`).send(newUser);
      expect(res).to.have.status(401);
      expect(res.body.error.message).to.equal('El correo aun no ha sido activado');
    });

    it('Should return 401 email incorrect', async () => {
      const res = await request(app)
        .post(`${urlEndpoint}/login`)
        .send({ email: errorEmail, password: '123456' });

      expect(res).to.have.status(401);
      expect(res.body.error.message).to.equal('Credenciales incorrectas');
    });

    it('Should return 401 email correct but password incorrect', async () => {
      const adminIncorrect = {
        ...admin,
        password: 'incorrectPassword',
      };
      const res = await request(app)
        .post(`${urlEndpoint}/login`)
        .send(adminIncorrect);
      expect(res).to.have.status(401);
      expect(res.body.error.message).to.equal('Credenciales incorrectas');
    });

    it('Should return 200, success case', async () => {
      const res = await request(app).post(`${urlEndpoint}/login`).send(admin);

      expect(res).to.have.status(200);
      assert.property(res.body, 'token');
      assert.isObject(res.body.data, 'Data its a object');
    });
  });

  // TODO: Implements test in sendEmailVerify method
  describe('Logout Enpoint', () => {
    it('Should return 200, success case', async () => {
      const res = await request(app).get(`${urlEndpoint}/logout`);
      expect(res).to.have.status(200);
    });
  });

  describe('ForgotPassword Endpoint', () => {
    it('Should return 400, not send email', async () => {
      const res = await request(app).post(`${urlEndpoint}/forgotPassword`);
      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal('Correo es requerido');
    });

    it('Should return 404, when de email not exists en database', async () => {
      const res = await request(app)
        .post(`${urlEndpoint}/forgotPassword`)
        .send({ email: errorEmail });

      expect(res).to.have.status(404);
      expect(res.body.error.message).to.equal('Correo no existente');
    });

    it('Should return 200, success case', async () => {
      await request(app)
        .post(`${urlEndpoint}/signup`)
        .send(authData.userSignup);

      const { email } = authData.userSignup;
      const res = await request(app)
        .post(`${urlEndpoint}/forgotPassword`)
        .send({ email });

      expect(res).to.have.status(200);
      expect(res.body.message).to.equal('Token enviado a su correo.');
    });
  });

  describe('ResetPassword Endpoint', () => {
    let tokenPassword;

    before(async () => {
      const { body } = await request(app)
        .post(`${urlEndpoint}/forgotPassword`)
        .send({ email: user.email });

      const { resetUrl } = body.data;
      tokenPassword = resetUrl.split('/').slice(-1)[0];
    });

    it('Should return 500, token non-existent user', async () => {
      const res = await request(app)
        .patch(`${urlEndpoint}/resetPassword/12345`)
        .send({ password: '1234', confirmPassword: '1234' });

      expect(res).to.have.status(500);
      expect(res.body.error.message).to.equal('Token invalido o ha expirado.');
    });

    it('Should return 400, Not equals password and confirmPassword', async () => {
      const res = await request(app)
        .patch(`${urlEndpoint}/resetPassword/${tokenPassword}`)
        .send({ password: '1234', confirmPassword: '12345' });

      expect(res).to.have.status(400);
      assert.include(res.body.error.message, 'Las contraseñas no coinciden');
    });

    it('Should return 200, set passwordResetToken and passwordResetExpires to undefined ', async () => {
      const res = await request(app)
        .patch(`${urlEndpoint}/resetPassword/${tokenPassword}`)
        .send({ password: '12345678', confirmPassword: '12345678' });

      expect(res).to.have.status(200);
      assert.property(res.body, 'token');
      assert.notProperty(res.body.data, 'passwordResetToken');
      assert.notProperty(res.body.data, 'passwordResetExpires');
    });
  });

  describe('UpdatePassword Enpoint', () => {
    const newPassword = '123456788';

    it('Should return 401, Invalid token', async () => {
      const fakeToken = `${tokenAdmin}2`;
      const res = await request(app)
        .post(`${urlEndpoint}/me/password`)
        .set({ Authorization: `Bearer ${fakeToken}` })
        .send({
          password: newPassword,
          confirmPassword: newPassword,
          currentPassword: admin.password,
        });

      expect(res).to.have.status(401);
      expect(res.body.error.message).to.equal(
        'Invalid token. Please log in again!'
      );
    });

    it('Should return 404, user not found', async () => {
      await UserRepository.deleteOne({ email: authData.userSignup.email });

      const resSignUp = await request(app)
        .post(`${urlEndpoint}/signup`)
        .send(authData.userSignup);

      await UserRepository.deleteOne({ email: authData.userSignup.email });

      const tokenNotExists = resSignUp.body.token;

      const res = await request(app)
        .post(`${urlEndpoint}/me/password`)
        .set({ Authorization: `Bearer ${tokenNotExists}` })

        .send({
          password: newPassword,
          confirmPassword: newPassword,
          currentPassword: admin.password,
        });

      expect(res).to.have.status(404);
      expect(res.body.error.message).to.equal('Usuario no encontrado.');
    });
    // Current password and password Send are different
    it('Should return 401, recent password change ', async () => {
      const res = await request(app)
        .post(`${urlEndpoint}/me/password`)
        .set({ Authorization: `Bearer ${userSaved.token}` })
        .send({
          password: newPassword,
          confirmPassword: newPassword,
          currentPassword: 'incorrectPassword',
        });

      expect(res).to.have.status(401);
      expect(res.body.error.message).to.equal(
        'Usuario recientemente cambio de contraseña! Por favor inicia sesión otra vez.'
      );
    });

    it('Should return 400, send currentPassword incorrect', async () => {
      const res = await request(app)
        .post(`${urlEndpoint}/me/password`)
        .set({ Authorization: `Bearer ${tokenAdmin}` })
        .send({
          password: newPassword,
          confirmPassword: newPassword,
          currentPassword: 'incorrectPassword',
        });

      expect(res).to.have.status(400);
      expect(res.body.error.message).to.equal('Contraseña invalida.');
    });
    // success case, overhaul user that include the new token.
    it('Should return 200, success', async () => {
      const res = await request(app)
        .post(`${urlEndpoint}/me/password`)
        .set({ Authorization: `Bearer ${tokenAdmin}` })
        .send({
          password: newPassword,
          confirmPassword: newPassword,
          currentPassword: admin.password,
        });

      expect(res).to.have.status(200);
      assert.property(res.body, 'token');
    });
  });
});
