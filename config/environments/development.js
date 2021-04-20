module.exports = {
  PORT: process.env.PORT,
  API_VERSION: process.env.API_VERSION,
  DB: {
    URL: process.env.MONGODB_URI,
  },
  EMAIL: {
    EMAIL_USERNAME: '3f13853f2a4027',
    EMAIL_PASSWORD: 'f2d7921d62bd7a',
    EMAIL_HOST: 'smtp.mailtrap.io',
    EMAIL_PORT: 2525,
    EMAIL_FROM: process.env.EMAIL_FROM,
  },
};
