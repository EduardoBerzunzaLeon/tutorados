const { assert, expect } = require('chai');

const container = require('../../../api/startup/container');

const { clearDir } = container.resolve('FileService');
const AuthService = container.resolve('AuthService');
const UserService = container.resolve('UserService');
const { initialize, data } = require('../../initialization/user');
const { credentials } = require('../../start.test');

describe('Auth Service', () => {
  let idAdmin;
  before(async () => {
    await initialize(data);
    const user = await UserService.getUsers({ email: data[0].email });
    idAdmin = user[0]._id;
  });

  describe('Signup Service', () => {
    it('Should return an error, user already exists ', async () => {
      let errorVerify;
      try {
        const user = await AuthService.signup(data[0]);
        console.log(user);
      } catch (error) {
        errorVerify = error;
      }

      assert.typeOf(errorVerify, 'Error');
      assert.equal(errorVerify.message, 'Usuario ya existe');
      assert.equal(errorVerify.statusCode, 401);
      assert.property(errorVerify, 'isOperational');
    });

    it('Should return an error, email does not have the correct structure', async () => {
      let errorVerify;
      const newUser = { ...data[0], email: 'incorrectEmail' };

      try {
        const user = await AuthService.signup(newUser);
        console.log(user);
      } catch (error) {
        errorVerify = error;
      }

      assert.typeOf(errorVerify, 'Error');
      assert.property(errorVerify.errors, 'email');
      assert.equal(
        errorVerify.errors.email,
        'Porfavor ingresa un correo valido'
      );
    });

    it('Should return a object with de user saved', async () => {
      const emailIncorrect = 'newEmail@gmail.com';
      const newUser = { ...data[0], email: emailIncorrect };
      const userSaved = await AuthService.signup(newUser);

      assert.equal(userSaved.email, emailIncorrect.toLowerCase());
      assert.isFalse(userSaved.active);
      assert.property(userSaved, 'password');
    });
  });

  describe('Active Service', () => {
    it("Should return an error, id doesn't correct", async () => {
      let errorVerify;

      try {
        await AuthService.activate({ id: '' });
      } catch (error) {
        errorVerify = error;
      }

      assert.typeOf(errorVerify, 'Error');
      assert.equal(errorVerify.message, 'El id es requerido');
      assert.equal(errorVerify.statusCode, 401);
    });

    it('Should return an object with property "active" in true', async () => {
      const { active } = await AuthService.activate({ id: idAdmin });
      assert.isTrue(active);
    });
  });
  // login
  describe.only('Login Service', () => {
    it('Should return an error, incorrect credentials', async () => {
      let errorVerify;

      try {
        await AuthService.login({
          email: 'incorrect@gmail.com',
          password: '123456',
        });
      } catch (error) {
        errorVerify = error;
      }
      assert.typeOf(errorVerify, 'Error');
      assert.equal(errorVerify.message, 'Credenciales incorrectas');
      assert.equal(errorVerify.statusCode, 401);
    });

    it('Should return an user object', async () => {
      const user = await AuthService.login(credentials.admin);
      assert.equal(user.email, credentials.admin.email);
      assert.isTrue(user.active);
    });
  });

  describe.only('Forgot Password Service', () => {
    // forgotpassword
    it("Should return an error, email doesn't send", async () => {
      let errorVerify;

      try {
        await AuthService.forgotPassword({}, '');
      } catch (error) {
        errorVerify = error;
      }

      assert.typeOf(errorVerify, 'Error');
      assert.equal(errorVerify.message, 'Correo es requerido');
      assert.equal(errorVerify.statusCode, 400);
    });
    // email doesn't exists in Database
    it("Should return an error, email doesn't exists in database", async () => {
      let errorVerify;

      try {
        await AuthService.forgotPassword({ email: 'notExists@gmail.com' }, '');
      } catch (error) {
        errorVerify = error;
      }

      assert.typeOf(errorVerify, 'Error');
      assert.equal(errorVerify.message, 'Correo no existente');
      assert.equal(errorVerify.statusCode, 404);
    });

    it('Should return an url sent', async () => {
      let errorVerify;
      const urlTest = 'urlTest/api/v1/users/resetPassword/';
      let urlReset;
      try {
        urlReset = await AuthService.forgotPassword(
          { email: 'eduardoberzunzal@gmail.com' },
          urlTest
        );
      } catch (error) {
        errorVerify = error;
      }

      assert.isUndefined(errorVerify);
      assert.include(urlReset, urlTest);
    });
  });
  // resetpassword
  // updatepassword
});
