const path = require('path');
// import { access, unlink } from 'fs/promises';
import { unlink } from 'fs/promises';
// import { constants, rename } from 'fs';
import { rename } from 'fs';

class FileService {
  constructor({ createAppError, randomString }) {
    this.createAppError = createAppError;
    this.randomString = randomString;
  }

  async deleteFile(path) {
    try {
      //   await access(path, constants.R_OK | constants.W_OK);
      await unlink(path);
    } catch {
      throw this.createAppError('No se pudo eliminar el archivo', 404);
    }
  }

  createImageName(file) {
    if (!file.hasOwnProperty('originalname') || !file.hasOwnProperty('path')) {
      throw this.createAppError('No se envio el archivo', 404);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    return this.randomString(30) + ext;
  }

  async uploadFile(file, model, _id, nameField = 'image', folder = 'images') {
    // Check if the file exists in the request
    const imgName = createImageName(file);

    const paramsFind = {};
    paramsFind[nameField] = imgName;

    const images = await model.findAll(paramsFind);

    if (images.length > 0) {
      this.uploadAvatar(file);
    } else {
      const imageTempPath = file.path;
      const targetPath = path.resolve(`public/uploads/${folder}/${imgName}`);

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
  }
}

module.exports = FileService;
