const mongoose = require('mongoose');

class Database {
  constructor({ config }) {
    this._config = config;
  }

  async dbConnection() {
    try {
      await mongoose.connect(this._config.DB.databaseURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      });

      console.log('DB Online');
    } catch (error) {
      console.log(error);
      throw new Error('Error a la hora de inicializar la BD');
    }
  }
}

module.exports = Database;
