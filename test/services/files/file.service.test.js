const { copyFile, access, readdir } = require('fs/promises');
const { constants } = require('fs');

const { assert, expect } = require('chai');
const { before } = require('mocha');

const container = require('../../../api/startup/container');
const FileService = container.resolve('FileService');
const UserRepository = container.resolve('UserRepository');
const { PATH_AVATAR_UPLOAD } = container.resolve('config');

const { initialize, data } = require('../../initialization/user');

describe('File Service', () => {
  const pathAssets = `${__dirname}/../../initialization/assets`;
  const mockFile = {
    originalname: 'exists',
    path: `${__dirname}`,
  };

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

  describe('Check If Exists In Request Service', () => {
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
        await FileService.checkIfExistInRequest(mockFile);
      } catch (error) {
        errorVerify = error;
      }

      assert.isUndefined(errorVerify);
    });
  });

  describe('Create Image Name Service', () => {
    it('Should return an object with imgName, url and urlComplete', async () => {
      const mockFileExtension = {
        ...mockFile,
        originalname: `${mockFile.originalname}.jpg`,
      };
      const data = await FileService.createImageName(mockFileExtension, 'img');

      assert.isObject(data);
      assert.property(data, 'imgName');
      assert.property(data, 'url');
      assert.property(data, 'urlComplete');
    });

    it('Should return an error, sned a file without extension', async () => {
      let errorVerify;

      try {
        await FileService.createImageName(mockFile, 'img');
      } catch (error) {
        errorVerify = error;
      }

      assert.typeOf(errorVerify, 'Error');
      assert.equal(
        errorVerify.message,
        'Es requerido que el archivo tenga una extensión'
      );
      assert.equal(errorVerify.statusCode, 400);
    });
  });

  describe('Upload Real File Service', () => {
    it('Should return an error when deletepath does not exist', async () => {
      let errorVerify;

      try {
        await FileService.uploadRealFile(
          `${mockFile.path}/${mockFile.originalname}.jpg`,
          '/pathNotExist/'
        );
      } catch (error) {
        errorVerify = error;
      }

      assert.typeOf(errorVerify, 'Error');
      assert.equal(
        errorVerify.message,
        'No se pudo subir el archivo al servidor, favor de volverlo a intentar'
      );
      assert.equal(errorVerify.statusCode, 400);
    });

    it('Should return an object when the method can rename deletePath for newPath', async () => {
      let errorVerify;
      await FileService.deleteFile(`${pathAssets}/renameNewFileService.png`);
      await FileService.deleteFile(`${pathAssets}/renameFileService.png`);

      await copyFile(
        `${pathAssets}/avatar.png`,
        `${pathAssets}/renameFileService.png`
      );

      try {
        await FileService.uploadRealFile(
          `${pathAssets}/renameFileService.png`,
          `${pathAssets}/renameNewFileService.png`
        );

        await access(`${pathAssets}/renameNewFileService.png`, constants.R_OK);
      } catch (error) {
        errorVerify = error;
      }

      assert.isUndefined(errorVerify);
    });
  });

  describe('Save In DB Service', () => {
    let user;
    const mockFakeImageData = {
      imgName: 'myImagen.jpg',
      url: 'myurl',
      urlComplete: 'myurl/myimagen.jpg',
    };

    beforeEach(async () => {
      await initialize(data);
      user = await UserRepository.findOne({ email: data[0].email });
    });
    // id not found
    it('Should return an error for sent an expired id', async () => {
      let errorVerify;
      await initialize(data);

      try {
        await FileService.saveInDB(
          user._id,
          UserRepository,
          mockFakeImageData,
          'avatar'
        );
      } catch (error) {
        errorVerify = error;
      }

      assert.typeOf(errorVerify, 'Error');
      assert.equal(
        errorVerify.message,
        'No se encontro el registro en la base de datos'
      );
      assert.equal(errorVerify.statusCode, 404);
      assert.isTrue(errorVerify.isOperational);
    });

    it('Should return an error for sent and incorrect field', async () => {
      let errorVerify;

      try {
        await FileService.saveInDB(
          user._id,
          UserRepository,
          mockFakeImageData,
          'notField'
        );
      } catch (error) {
        errorVerify = error;
      }
      assert.typeOf(errorVerify, 'Error');
      assert.equal(
        errorVerify.message,
        'No se encontro el campo en el elemento a modificar'
      );
      assert.equal(errorVerify.statusCode, 404);
      assert.isTrue(errorVerify.isOperational);
    });

    it('Should return an error for send an empty object in image', async () => {
      let errorVerify;

      try {
        await FileService.saveInDB(user._id, UserRepository, {}, 'avatar');
      } catch (error) {
        errorVerify = error;
      }
      assert.typeOf(errorVerify, 'Error');
      assert.equal(errorVerify.message, 'No se encontró datos del archivos');
      assert.equal(errorVerify.statusCode, 404);
      assert.isTrue(errorVerify.isOperational);
    });

    it('Should return an filename saved in database', async () => {
      const imagenToSave = 'saveInDBFileService.png';
      await FileService.deleteFile(`${pathAssets}/${imagenToSave}`);

      await copyFile(
        `${pathAssets}/avatar.png`,
        `${pathAssets}/${imagenToSave}`
      );

      const imagen = {
        imgName: imagenToSave,
        url: pathAssets,
        urlComplete: `${pathAssets}/${this.imgName}`,
      };

      const fileSaved = await FileService.saveInDB(
        user._id,
        UserRepository,
        imagen,
        'avatar'
      );

      const { avatar } = await UserRepository.findOne({ email: user.email });

      assert.equal(fileSaved, avatar);
      assert.equal(fileSaved, imagenToSave);
    });
  });

  describe('Upload File Service', () => {
    it('Success case', async () => {
      const filename = 'renameFileService.png';
      const file = {
        path: `${PATH_AVATAR_UPLOAD}${filename}`,
        originalname: filename,
      };
      await FileService.clearDir(PATH_AVATAR_UPLOAD);
      await copyFile(
        `${pathAssets}/avatar.png`,
        `${PATH_AVATAR_UPLOAD}${filename}`
      );

      const uploadFile = FileService.uploadFile();
      const image = await uploadFile.bind(FileService, file)();

      const files = await readdir(PATH_AVATAR_UPLOAD);

      expect(files).to.length(1);
      assert.equal(files[0], image.imgName);
      assert.property(image, 'imgName');
      assert.property(image, 'url');
      assert.property(image, 'urlComplete');
    });
  });

  describe('Clear dir Service', () => {
    it('Should delete all files in determinate directory', async () => {
      await copyFile(
        `${pathAssets}/avatar.png`,
        `${PATH_AVATAR_UPLOAD}renameFileService.png`
      );

      const filesBeforeDelete = await readdir(PATH_AVATAR_UPLOAD);
      await FileService.clearDir(PATH_AVATAR_UPLOAD);
      const filesAfterDelete = await readdir(PATH_AVATAR_UPLOAD);

      assert.isAbove(filesBeforeDelete.length, 0);
      expect(filesAfterDelete).to.length(0);
    });
  });
});
