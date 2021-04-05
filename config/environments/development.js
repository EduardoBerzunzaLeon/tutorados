module.exports = {
  PORT: process.env.PORT,
  API_VERSION: process.env.API_VERSION,
  DB: {
    databaseURL: process.env.MONGODB_URI,
  },
};
