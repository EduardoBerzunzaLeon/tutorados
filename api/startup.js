class Startup {
    constructor({ Server }) {
        this._Server = Server;
    }

    async start() {
        await this._Server.start();
    }
}

module.exports = Startup;