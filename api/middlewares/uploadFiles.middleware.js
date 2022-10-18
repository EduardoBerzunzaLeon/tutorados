const path = require('path');
const multer = require('multer');

// Todo: Implements SHARP in images
// imageFIle = `asdasd-asdasd-asdasd.jpef`;
// await sharp(req.file.buffer)
// .resize(2000, 1333)
// .toFormat('jpeg')
// .jpeg({ quality: 90})
// .toFile(`public/img/tours ${imageFile}`)

module.exports =
  ({ config, createAppError }) =>
  (filetypes, fileSize, fieldname, pathTemp = config.PATH_TEMP) =>
  (req, res, next) => {
    const fileFilter = (req, file, cb) => {

      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      
      if (extname) {
        return cb(null, true);
      }
      
      cb(createAppError(
            `El archivo solo soporta las siguientes extensiones: - ${filetypes}`,
            400
          ),
            false
          );
    };
        
    const upload = multer({
      dest: path.join(__dirname, pathTemp),
      fileFilter,
      limits: { fileSize },
    }).single(fieldname);
        
    upload(req, res, (err) => {
      if (err) {
        next(err);
      }
      next();
    });

  };
