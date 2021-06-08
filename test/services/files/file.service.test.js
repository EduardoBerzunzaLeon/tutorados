const { copyFile } = require('fs/promises');
const { assert } = require('chai');

const container = require('../../../api/startup/container');
const { before } = require('mocha');
const FileService = container.resolve('FileService');

describe.only('File Service', () => {
  const pathAssets = `${__dirname}/../../initialization/assets`;
  describe('Delete File Service', () => {
    before(async () => {
      await copyFile(
        `${pathAssets}/avatar.png`,
        `${pathAssets}/deletefileservice.png`
      );
    });

    it('Should return false, not found the file', async () => {
      const exists = await FileService.deleteFile(`${__dirname}/notexist.pdf`);
      assert.isFalse(exists);
    });

    it('Should return true, deleted the file', async () => {
      const exists = await FileService.deleteFile(
        `${pathAssets}/deletefileservice.png`
      );
      assert.isTrue(exists);
    });
  });

  describe.only('Check If Exists In Request', () => {
    it('Should return an error, if don´t send originalname or path property ', async () => {
      let errorVerify;

      try {
        await FileService.checkIfExistInRequest({ originalname: 'dontExists' });
      } catch (error) {
        errorVerify = error;
      }

      assert.typeOf(errorVerify, 'Error');
      assert.equal(errorVerify.message, 'No se envio el archivo');
      assert.equal(errorVerify.statusCode, 404);
    });

    it("Should don't return an error ", async () => {
      let errorVerify;

      try {
        await FileService.checkIfExistInRequest({
          originalname: 'exists',
          path: `${__dirname}`,
        });
      } catch (error) {
        errorVerify = error;
      }

      assert.isUndefined(errorVerify);
    });
  });
});
