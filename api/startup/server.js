class Server {
  constructor({ config, App }) {
    this.app = App.app;
    this.port = this.normalizePort(config.PORT);
    this.config = config;
  }

  normalizePort(port) {
    const portInt = parseInt(port, 10);
    return !isNaN(portInt) ? portInt : 3500;
  }

  start() {
    return new Promise((resolve, reject) => {
      const http = this.app.listen(this.port, () => {
        const { port } = http.address();
        console.log(`Application running on port ${port}`);
        resolve(http);
      });
    });
  }

  errorsListener(http) {
    process.once('unhandledRejection', (err) => {
      console.log('UNHANDLED REJECTION! 💥 Shutting down...');
      console.log(err.name, err.message);
      http.close(() => {
        process.exit(1);
      });
    });

    process.once('SIGTERM', () => {
      console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
      http.close(() => {
        console.log('💥 Process terminated!');
      });
    });
  }
}

module.exports = Server;
