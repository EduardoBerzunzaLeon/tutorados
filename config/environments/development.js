const PERMISSIONS_LIST = require("../authorization/permissions");
const ROLES_LIST = require("../authorization/roles");

module.exports = {
  PORT: process.env.PORT,
  API_VERSION: process.env.API_VERSION,
  PATH_TEMP: process.env.PATH_UPLOAD_TEMP,
  PATH_FILE_UPLOAD: 'public/uploads/',
  PATH_AVATAR_UPLOAD: 'public/uploads/img/',
  PATH_STATIC_FILES: process.env.PATH_STATIC_FILES,
  DB: {
    URL: process.env.MONGODB_URI,
  },
  EMAIL: {
    EMAIL_USERNAME: '465a119470cec5',
    EMAIL_PASSWORD: '23dafc6e8cf4bc',
    EMAIL_HOST: 'smtp.mailtrap.io',
    EMAIL_PORT: 2525,
    EMAIL_FROM: process.env.EMAIL_FROM,
  },
  SECURITY: {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN,
  },
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  },
  FACEBOOK: {
    CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
  },
  ROLES_LIST: ROLES_LIST,
  PERMISSIONS_LIST: PERMISSIONS_LIST 
};
