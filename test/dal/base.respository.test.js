const { expect, assert } = require('chai');

const BaseRepository = require('../../dal/base.repository');
const container = require('../../api/startup/container');
const UserEntity = container.resolve('UserEntity');

const { initialize, data } = require('../initialization/user');

describe('Base Repository', () => {
  let baseRepository;
  let user;
  const [{ email: emailAdmin }] = data;

  before(async () => {
    await initialize(data);
    baseRepository = new BaseRepository(UserEntity);
    user = await baseRepository.findOne({
      email: emailAdmin,
    });
  });

  describe('Find All', () => {
    it(`Should return an array with one object with email ${emailAdmin}`, async () => {
      const users = await baseRepository.findAll({
        email: emailAdmin,
      });

      const [user] = users;
      expect(users).to.have.length(1);
      expect(user.role).to.equal('admin');
      expect(user.email).to.equal(emailAdmin);
      expect(user.avatar).to.equal('default.jpg');
    });

    it('Should return an array empty with email not found in DB', async () => {
      const users = await baseRepository.findAll({
        email: 'notExists@gmail.com',
      });
      assert.isEmpty(users);
    });

    it('Should return an array with one object with email cindy.peña and unique fields "email, role, id, name"', async () => {
      const users = await baseRepository.findAll({
        page: 1,
        limit: 1,
        sort: 'email',
        fields: 'email, role, name',
      });

      const [user] = users;
      const { ...userNew } = user.toObject();

      expect(users).to.have.length(1);
      expect(user.role).to.equal('user');
      expect(user.email).to.equal('cindy.peña@gmail.com');
      assert.hasAllKeys(userNew, ['email', 'role', '_id', 'name']);
      assert.propertyVal(user.name, 'first', 'Cindy');
    });
  });

  describe('FindById', () => {
    it('Should return a object by ID', async () => {
      const userGotten = await baseRepository.findById(user.id);
      assert.isObject(userGotten);
      expect(userGotten.id).to.equal(user.id);
    });

    it('Should return null by id not found', async () => {
      const userGotten = await baseRepository.findById('asdasdasdasd');
      assert.isNull(userGotten);
    });
    // TODO: Implements populate
  });

  describe('FindByOne', () => {
    it('Should return a object by ID', async () => {
      const emailVerify = emailAdmin;

      const user = await baseRepository.findOne({ email: emailVerify });
      assert.isObject(user);
      expect(user.email).to.equal(emailVerify);
    });

    it('Should return null by id not found', async () => {
      const emailNotExist = 'notExist@gmail.com';
      const user = await baseRepository.findOne({ email: emailNotExist });
      assert.isNull(user);
    });
    // TODO: Implements populate
  });

  describe('UpdateById', () => {
    it('Should return a object with first and last name updated', async () => {
      const emailVerify = emailAdmin;
      const userSaved = await baseRepository.updateById(user.id, {
        name: { first: 'Dash', last: 'Disfrash' },
      });
      assert.isObject(userSaved);
      expect(userSaved.email).to.equal(emailVerify);
      expect(userSaved.name.first).to.equal('Dash');
      expect(userSaved.name.last).to.equal('Disfrash');
    });

    it('Should return error, its necessary send lastname when modified the property name ', async () => {
      let errorSend;
      try {
        await baseRepository.updateById(user.id, {
          name: { first: 'Dash' },
        });
      } catch (error) {
        errorSend = error;
      }

      assert.instanceOf(errorSend, Error);
      assert.include(errorSend.errors['name.last'], {
        message: 'El apellido es obligatorio',
      });
    });
  });

  describe('Delete endpoints', () => {
    let userDelete;
    beforeEach(async () => {
      await initialize(data);
      baseRepository = new BaseRepository(UserEntity);
      userDelete = await baseRepository.findOne({
        email: emailAdmin,
      });
    });

    describe('DeleteById', () => {
      it('Should delete one record', async () => {
        const deleted = await baseRepository.deleteById(userDelete.id);
        const users = await baseRepository.findAll();
        const foundUser = users.find(
          ({ _id }) => String(_id) === String(deleted.id)
        );

        assert.equal(deleted.email, emailAdmin);
        assert.equal(deleted._id, userDelete.id);

        expect(users).to.have.length(1);
        assert.isUndefined(foundUser);
      });

      it('Should not delete any element', async () => {
        const deleted = await baseRepository.deleteById(user.id);
        const deletedWithoutId = await baseRepository.deleteById();
        const users = await baseRepository.findAll();
        const foundUser = users.find(
          ({ _id }) => String(_id) === String(userDelete.id)
        );

        assert.isNull(deleted);
        assert.isNull(deletedWithoutId);
        expect(users).to.have.length(2);
        assert.isDefined(foundUser);
      });

      it('Should return a MONGO ERROR, cast to ObjectId failed', async () => {
        let errorCatched;
        try {
          await baseRepository.deleteById('asdasfdsdgfasfdg');
        } catch (error) {
          errorCatched = error;
        }

        assert.equal(errorCatched.path, '_id');
        assert.instanceOf(errorCatched, Error);
        assert.isTrue(errorCatched.stack.startsWith('CastError'));
        assert.include(errorCatched.stack, 'ObjectId failed');
      });
    });

    describe('DeleteOne', () => {
      it('Should delete one record', async () => {
        const deleted = await baseRepository.deleteOne({
          email: userDelete.email,
        });
        const users = await baseRepository.findAll();
        const foundUser = users.find(
          ({ _id }) => String(_id) === String(deleted.id)
        );

        assert.equal(deleted.email, userDelete.email);
        assert.equal(deleted._id, userDelete.id);
        expect(users).to.have.length(1);
        assert.isUndefined(foundUser);
      });

      it('Should not delete any element', async () => {
        const deleted = await baseRepository.deleteOne({
          email: 'noExists@gmail.com',
        });
        const deletedWithoutId = await baseRepository.deleteOne();

        const users = await baseRepository.findAll();
        const foundUser = users.find(
          ({ _id }) => String(_id) === String(userDelete.id)
        );

        assert.isNull(deleted);
        assert.isNull(deletedWithoutId);
        expect(users).to.have.length(2);
        assert.isDefined(foundUser);
      });

      it('Should return an array with 2 elements when send in params a propety that not exists', async () => {
        const deleted = await baseRepository.deleteOne({
          notExists: 'noExists@gmail.com',
        });

        const users = await baseRepository.findAll();

        assert.isNull(deleted);
        expect(users).to.have.length(2);
      });
    });

    describe('DeleteAll', () => {
      it('Should return an empty array', async () => {
        const deleted = await baseRepository.deleteAll();
        const users = await baseRepository.findAll();

        expect(users).to.have.length(0);
        assert.equal(deleted.n, 2);
        assert.equal(deleted.ok, 1);
        assert.equal(deleted.deletedCount, deleted.n);
      });
    });
  });

  // Create
  describe('Create', () => {
    beforeEach(async () => {
      await baseRepository.deleteAll();
    });

    it('Should return a element created and array with this element', async () => {
      const userCreated = await baseRepository.create(data[0]);
      const users = await baseRepository.findAll();

      expect(users).to.have.length(1);
      assert.equal(users[0].email, userCreated.email);
      assert.equal(String(users[0]._id), String(userCreated._id));
    });

    it('Should return an error when try to add an other element with the same field unique', async () => {
      const { email } = await baseRepository.create(data[0]);
      let errorCatched;
      try {
        await baseRepository.create(data[0]);
      } catch (error) {
        errorCatched = error;
      }

      const users = await baseRepository.findAll();

      assert.instanceOf(errorCatched, Error);
      assert.include(errorCatched, { code: 11000 });
      expect(users).to.have.length(1);
      assert.equal(users[0].email, email);
    });

    it('Should return an error when dont send a required field', async () => {
      const [{ email, ...user }] = data;

      let errorCatched;
      try {
        await baseRepository.create(user);
      } catch (error) {
        errorCatched = error;
      }

      assert.instanceOf(errorCatched, Error);
      assert.include(errorCatched, { _message: 'User validation failed' });
      assert.include(errorCatched.errors.email.properties, {
        message: 'El email es obligatorio',
      });
    });
  });
  // Save
  describe('Save', () => {
    let user;
    before(async () => {
      await initialize(data);
      user = await baseRepository.findOne({
        email: emailAdmin,
      });
    });

    it('Should return and error, if send password but not confirmPassword', async () => {
      let errorCatched;

      user.name.first = 'rosita';
      user.password = '123345';
      try {
        await baseRepository.save(user);
      } catch (error) {
        errorCatched = error;
      }

      assert.instanceOf(errorCatched, Error);
      assert.include(errorCatched, { _message: 'User validation failed' });
      assert.include(errorCatched.errors.confirmPassword.properties, {
        message: 'Por favor confirmar su contraseña',
      });
    });

    it('Should return an error when try to save undefined password and confirmPassword but the flag validateBeforeSave in false', async () => {
      user.password = undefined;
      user.confirmPassword = undefined;

      user.name.first = 'rosita';

      let errorCatched;

      try {
        await baseRepository.save(user, {
          validateBeforeSave: false,
        });
      } catch (error) {
        errorCatched = error;
      }
      assert.instanceOf(errorCatched, Error);
      assert.include(
        errorCatched.stack,
        'Illegal arguments: undefined, number'
      );
    });

    it('Should return an element saved with password and confirmPassword', async () => {
      user.password = '12345657776';
      user.confirmPassword = '12345657776';

      const userSaved = await baseRepository.save(user);

      assert.isDefined(userSaved.passwordChangedAt);
      assert.instanceOf(userSaved.passwordChangedAt, Date);
      assert.isUndefined(userSaved.confirmPassword);
    });

    it('Should return an element saved when not change password', async () => {
      delete user.password;
      delete user.confirmPassword;
      user.name.first = 'Dash';

      const userSaved = await baseRepository.save(user, {
        validateBeforeSave: false,
      });

      assert.isObject(userSaved);
      assert.equal(userSaved.name.first, 'Dash');
    });
  });
});
