const path = require('path');
const multer = require('multer');

module.exports =
  ({ config, createAppError }) => (filetypes, maxCount, fieldname, pathTemp = config.PATH_TEMP) =>
  (req, res, next) => {
    const multerStorage = multer.memoryStorage();
  
    const multerFilter =  (req, file, cb) => {
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      
      if (extname) {
        return cb(null, true);
      }
      
      cb(createAppError( `El archivo solo soporta las siguientes extensiones: - ${filetypes}`,
        400
      ), false);
      
    }
  
    const upload = multer({
      dest: path.join(__dirname, pathTemp),
      storage: multerStorage,
      filteFilter: multerFilter,
    }).array(fieldname, maxCount);

    upload(req, res, (err) => {
      if (err) {
        next(err);
      }
      next();
    });
  
  }