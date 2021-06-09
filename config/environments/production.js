module.exports = {
  PORT: process.env.PORT,
  PATH_FILE_UPLOAD: 'public/uploads/',
  PATH_AVATAR_UPLOAD: 'public/uploads/img/',
  DB: {
    USERNAME: 'postgres',
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE: 'school_prod',
    HOST: process.env.DB_HOST,
    DIALECT: 'postgres',
  },
  EMAIL: {
    EMAIL_FROM: process.env.EMAIL_FROM,
    SENDGRID_USERNAME: process.env.SENDGRID_USERNAME,
    SENDGRID_PASSWORD: process.env.SENDGRID_PASSWORD,
  },
  SECURITY: {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN,
  },
};
