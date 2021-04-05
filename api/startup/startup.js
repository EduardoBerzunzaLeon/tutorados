const { trimRight } = require('../../helpers/getEnviroment');

class Startup {
  constructor({ Server, Database }) {
    this._Server = Server;
    this._Database = Database;
  }

  async start() {
    const [server] = await Promise.all([
      this._Server.start(),
      this._Database.dbConnection(),
    ]);

    // If the server detect somekind of error, the server will shutdown.
    this._Server.errorsListener(server);
  }
}

module.exports = Startup;
