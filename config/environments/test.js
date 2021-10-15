module.exports = {
  PORT: process.env.PORT,
  API_VERSION: process.env.API_VERSION,
  PATH_TEMP: process.env.PATH_UPLOAD_TEMP,
  PATH_FILE_UPLOAD: 'test/public/uploads/',
  PATH_AVATAR_UPLOAD: 'test/public/uploads/img/',
  DB: {
    URL: process.env.MONGODB_URI_TEST,
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
};
