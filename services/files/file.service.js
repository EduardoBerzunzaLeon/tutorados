const path = require('path');
const { access, rename, unlink, readdir } = require('fs/promises');
const { constants } = require('fs');

class FileService {
  constructor({ createAppError, generateRandomString, config }) {
    this.createAppError = createAppError;
    this.generateRandomString = generateRandomString;
    this.PATH_FILE_UPLOAD = config.PATH_FILE_UPLOAD;
  }

  async deleteFile(path) {
    try {
      await unlink(path);
      return true;
    } catch {
      return false;
    }
  }

  checkIfExistInRequest(file) {
    if (
      !file?.hasOwnProperty('originalname') ||
      !file?.hasOwnProperty('path')
    ) {
      throw this.createAppError('No se envio el archivo', 404);
    }
  }

  async createImageName(file, folder) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '')
      throw this.createAppError(
        'Es requerido que el archivo tenga una extensión',
        400
      );
    const imgName = this.generateRandomString(30) + ext;
    const url = path.resolve(`${this.PATH_FILE_UPLOAD}${folder}`);
    const urlComplete = path.resolve(`${url}/${imgName}`);

    try {
      await access(`${url}${imgName}`, constants.R_OK);
      return createImageName(file, folder);
    } catch (error) {
      return { imgName, url, urlComplete };
    }
  }

  async uploadRealFile(deletePath, newPath) {
    try {
      await rename(deletePath, newPath);
    } catch (error) {
      await this.deleteFile(deletePath);
      throw this.createAppError(
        'No se pudo subir el archivo al servidor, favor de volverlo a intentar',
        400
      );
    }
  }

  async saveInDB(_id, repository, image, field) {
    const { imgName, url, urlComplete } = image;

    try {
      if (!imgName || !url || !urlComplete)
        throw this.createAppError('No se encontró datos del archivos', 404);

      const dataUpdate = { [field]: imgName };
      const exists = await repository.findById(_id);

      if (!exists)
        throw this.createAppError(
          'No se encontro el registro en la base de datos',
          404
        );

      if (!exists[field])
        throw this.createAppError(
          'No se encontro el campo en el elemento a modificar',
          404
        );

      if (exists[field] !== '' || exists[field] !== 'default.jpg') {
        await this.deleteFile(`${url}/${exists[field]}`);
      }

      const fileStored = await repository.updateById(_id, dataUpdate);
      if (!fileStored) {
        await this.deleteFile(urlComplete);
        throw this.createAppError(
          'Ocurrio un error al guardar la imagen a la Base de datos',
          400
        );
      }
      return fileStored[field];
    } catch (error) {
      if (error.isOperational) throw error;
      await this.deleteFile(urlComplete);
      throw this.createAppError('No se pudo mover el archivo', 400);
    }
  }

  uploadFile(folder = 'img') {
    return async function (file) {
      this.checkIfExistInRequest(file);
      const fileUpload = await this.createImageName(file, folder);
      await this.uploadRealFile(file.path, fileUpload.urlComplete);
      return fileUpload;
    };
  }

  async clearDir(dir) {
    const files = await readdir(dir);

    if (files.length > 0) {
      const promises = files.map((file) => unlink(`${dir}${file}`));
      await Promise.all(promises);
    }
  }
}

module.exports = FileService;
