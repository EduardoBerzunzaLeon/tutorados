const path = require('path');

const multer = require('multer');

const uploadSingleFile = ({ config, createAppError }) => (
  filetypes,
  fileSize,
  fieldname,
  pathTemp = config.PATH_TEMP
) => (req, res, next) => {
  const fileFilter = (req, file, cb) => {
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(
      createAppError(
        `El archivo solo soporta las siguientes extensiones: - ${filetypes}`,
        404
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
      console.log(err);
      next(err);
    }
    next();
  });
};

module.exports = uploadSingleFile;
