module.exports = {
    PORT: process.env.PORT,
    API_VERSION: process.env.API_VERSION,
    DB: {
      username: "postgres",
      password: "mysecretpassword",
      database: "school_dev",
      host: "localhost",
      dialect: "postgres",
      logging: false
    }
  };
  