const path = require('path');
// import { access, unlink } from 'fs/promises';
const { unlink } = require('fs/promises');
// import { constants, rename } from 'fs';
const { rename } = require('fs');

class FileService {
  constructor({ createAppError, generateRandomString }) {
    this.createAppError = createAppError;
    this.generateRandomString = generateRandomString;
  }

  async deleteFile(path) {
    try {
      //   await access(path, constants.R_OK | constants.W_OK);
      await unlink(path);
    } catch {
      throw this.createAppError('No se pudo eliminar el archivo', 404);
    }
  }

  checkIfExistInRequest(file) {
    if (!file.hasOwnProperty('originalname') || !file.hasOwnProperty('path')) {
      throw this.createAppError('No se envio el archivo', 404);
    }
  }

  async createImageName(file, folder) {
    const ext = path.extname(file.originalname).toLowerCase();
    const imgName = this.generateRandomString(30) + ext;
    const path = path.resolve(`public/uploads/${folder}/${imgName}`);

    if (await access(path, constants.R_OK)) {
      return await createImageName(file, folder);
    } else {
      return { imgName, path };
    }
  }

  async saveInEntity(model, file, imgName, url, paramsFind) {
    const imageTempPath = file.path;
    const targetPath = url;
    try {
      const [fileStored] = await Promise.all([
        model.updateById(_id, paramsFind),
        rename(imageTempPath, targetPath),
      ]);
      if (!fileStored) {
        deleteFile(targetPath);
        deleteFile(imageTempPath);
        throw this.createAppError(
          'Ocurrio un error al guardar la imagen a la Base de datos',
          404
        );
      }
      return imgName;
    } catch (error) {
      console.log(error);
      deleteFile(targetPath);
      deleteFile(imageTempPath);
      throw this.createAppError('No se pudo mover el archivo', 404);
    }
  }

  uploadFile(model, folder = 'images', field = 'image') {
    return async function (file) {
      checkIfExistInRequest(file);
      const { imgName, path: url } = await createImageName(file, folder);
      // const paramsFind = { [field]: imgName };
      // await saveInEntity(model, file, imgName, url, paramsFind);
    };
  }

  // TODO: Implements this in user service
  // uploadAvatar = this.uploadFile(User, 'images', 'avatar');
}

module.exports = FileService;
