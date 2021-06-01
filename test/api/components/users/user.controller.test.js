const { readFile } = require('fs/promises');

const chai = require('chai');
const chaiHttp = require('chai-http');
const { assert, expect } = require('chai');

const container = require('../../../../api/startup/container');
const { app } = container.resolve('App');
const { clearDir } = container.resolve('FileService');
const { postAuthentication, credentials } = require('../../../start.test');
const { initialize, data } = require('../../../initialization/user');

chai.use(chaiHttp);
const request = chai.request;

let tokenAdmin;
let tokenUser;

describe('Users api', () => {
  before(async () => {
    await initialize(data);
    const { admin, user } = credentials;

    const [{ body: adminResponse }, { body: userResponse }] = await Promise.all(
      [
        postAuthentication(admin),
        postAuthentication(user),
        // Clean img's image directory
        clearDir('./public/uploads/img/'),
      ]
    );

    tokenAdmin = adminResponse.token;
    tokenUser = userResponse.token;
  });

  describe('Get Users', () => {
    it('users are returned 401 without authetication', async () => {
      const res = await request(app).get('/api/v1/users');

      expect(res).to.have.status(401);
    });

    it('users are returned 403 with user role', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set({ Authorization: `Bearer ${tokenUser}` });

      expect(res).to.have.status(403);
    });

    it('users are returned data and status 200 with authetication', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set({ Authorization: `Bearer ${tokenAdmin}` });

      expect(res).to.have.status(200);
      assert.isArray(res.body.data, 'Its array');
      assert.equal(res.body.status, 'success', 'All is right');
    });

    it('Returned two records: one contains "Eduardo Jesus Berzunza Leon" and no one contain password property', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set({ Authorization: `Bearer ${tokenAdmin}` });
      const {
        body: { data: users },
      } = res;

      const findUser = users.find(
        ({ fullname }) => fullname === 'Eduardo Jesús Berzunza León'
      );
      const findPassword = users.find((u) => u['password'] !== undefined);

      assert.isUndefined(findPassword, 'Not returned the password field');
      assert.isObject(findUser, 'Not returned the password field');
    });
  });

  describe('Upload Avatar', () => {
    it('Should return 401 without authetication', async () => {
      const res = await request(app).patch('/api/v1/users/avatar');

      expect(res).to.have.status(401);
      expect(res.body.error.message).to.equal('Favor de iniciar sesión.');
    });

    it('Should return 404, Not file found', async () => {
      const res = await request(app)
        .patch('/api/v1/users/avatar')
        .set({ Authorization: `Bearer ${tokenUser}` });

      expect(res).to.have.status(404);
    });

    it('Should return 400 if upload no file extension', async () => {
      const noImage = await readFile(
        `${__dirname}/../../../initialization/assets/noImage.pdf`
      );
      const res = await request(app)
        .patch('/api/v1/users/avatar')
        .set('content-type', 'multipart/form-data')
        .set({ Authorization: `Bearer ${tokenUser}` })
        .attach('avatar', noImage, 'noImage.pdf');

      expect(res).to.have.status(400);
      assert.include(
        res.body.error.message,
        'El archivo solo soporta las siguientes extensiones',
        'Correctly message'
      );
    });

    it('Should return 200 and filename the avatar of user', async () => {
      const avatarFile = await readFile(
        `${__dirname}/../../../initialization/assets/avatar.png`
      );
      const res = await request(app)
        .patch('/api/v1/users/avatar')
        .set('content-type', 'multipart/form-data')
        .set({ Authorization: `Bearer ${tokenUser}` })
        .attach('avatar', avatarFile, 'avatar.png');

      expect(res).to.have.status(200);
      assert.property(res.body.data, 'avatar');
    });
  });
});
