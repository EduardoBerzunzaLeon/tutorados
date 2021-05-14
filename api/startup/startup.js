class Startup {
  constructor({ Server, Database }) {
    this.server = Server;
    this.database = Database;
  }

  async start() {
    const [server] = await Promise.all([
      this.server.start(),
      this.database.dbConnection(),
    ]);

    // If the server detect somekind of error, the server will shutdown.
    this.server.errorsListener(server);
    return server;
  }
}

module.exports = Startup;
