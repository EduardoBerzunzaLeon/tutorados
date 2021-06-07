const { assert, expect } = require('chai');

const container = require('../../../api/startup/container');

const { clearDir } = container.resolve('FileService');
const { postAuthentication, credentials } = require('../../start.test');
const { initialize, data } = require('../../initialization/user');

describe('User Service', () => {
  let tokenAdmin;
  let tokenUser;
  before(async () => {
    await initialize(data);
    const [{ body: adminResponse }, { body: userResponse }] = await Promise.all(
      [
        postAuthentication(admin),
        postAuthentication(user),
        // Clean img's image directory
        clearDir('./public/uploads/img/'),
      ]
    );
  });
  tokenAdmin = adminResponse.token;
  tokenUser = userResponse.token;

  describe('Get Users', () => {
    it('should return two users', () => {});
  });
});
