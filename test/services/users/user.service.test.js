const { copyFile, access } = require('fs/promises');
const { constants } = require('fs');

const { assert, expect } = require('chai');

const container = require('../../../api/startup/container');

const { clearDir } = container.resolve('FileService');
const UserService = container.resolve('UserService');
const { initialize, data } = require('../../initialization/user');

describe('User Service', () => {
  let idAdmin;
  const pathAssets = `${__dirname}/../../initialization/assets`;
  before(async () => {
    await Promise.all([
      await initialize(data),
      await clearDir('./public/uploads/img/'),
      await copyFile(
        `${pathAssets}/avatar.png`,
        `${pathAssets}/deleteAvatar.png`
      ),
    ]);

    const user = await UserService.getUsers({ email: data[0].email });
    idAdmin = user[0]._id;
  });

  describe('Get Users Service', () => {
    it('Should return two users and coincide with data in position 0', async () => {
      const users = await UserService.getUsers();
      const exists = users.find(({ email }) => email === data[0].email);

      expect(users).to.length(data.length);
      assert.property(users[0], 'email');
      assert.isObject(exists);
    });

    it('Should return an empty array', async () => {
      const users = await UserService.getUsers({ email: 'notExistsEmail' });

      assert.isArray(users);
      assert.isEmpty(users);
    });

    it('Should return an sorted array with one element', async () => {
      const users = await UserService.getUsers({
        sort: 'email',
        page: 1,
        limit: 1,
      });

      const [{ email: emailCheck }] = data.sort((a, b) => {
        if (a.email < b.email) return -1;
        if (a.email > b.email) return 1;
        return 0;
      });

      assert.isArray(users);
      expect(users).to.length(1);
      assert.equal(users[0].email, emailCheck);
    });
  });

  describe('Find By Id Service', () => {
    it('should return an object with specified id', async () => {
      const [{ _id }] = await UserService.getUsers();

      const user = await UserService.findById(_id);
      assert.isObject(user);
      assert.equal(String(user._id), String(_id));
    });

    it('should return an Error, id is not mongo structure', async () => {
      let errorVerify;
      try {
        await UserService.findById(12345);
      } catch (error) {
        errorVerify = error;
      }

      assert.typeOf(errorVerify, 'Error');
      assert.equal(errorVerify.name, 'CastError');
      assert.include(
        String(errorVerify.reason),
        'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
      );
    });
  });

  describe('Upload Avatar Service', () => {
    it("should return an error, didn't passed file", async () => {
      let errorVerify;
      try {
        await UserService.uploadAvatar(idAdmin, '');
      } catch (error) {
        errorVerify = error;
      }

      assert.typeOf(errorVerify, 'Error');
      assert.equal(errorVerify.statusCode, 404);
      assert.equal(errorVerify.message, 'No se envio el archivo');
    });

    it('Should return an Error, the file uploaded have a extension not allowed', async () => {
      let canAccess = false;
      let errorVerify;
      try {
        const fileUploaded = await UserService.uploadAvatar(idAdmin, {
          originalname: 'deleteAvatar.png',
          path: `${pathAssets}/deleteAvatar.png`,
        });

        const [user] = await UserService.getUsers({ avatar: fileUploaded });

        await access(
          `${__dirname}/../../../public/uploads/img/${user.avatar}`,
          constants.R_OK
        );

        canAccess = true;
      } catch (error) {
        errorVerify = error;
      }

      assert.isUndefined(errorVerify);
      assert.isTrue(canAccess);
    });
  });
});
