class Server {
    constructor({ config, App }) {
        this._app = App.app;
        this.port = this.normalizePort(config.PORT);
    }

    normalizePort(port) {
        const portInt = parseInt(port, 10);
        return !isNaN(portInt) ? portInt : 3500;
    }

    start() {
        return new Promise((resolve, reject) => {
            const http = this._app.listen(this.port, () => {
                const { port } = http.address();
                console.log(`Application running on port ${port}`);
                resolve();
            });
        })
    }
}

module.exports = Server;