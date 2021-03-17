const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const compression = require("compression");

class App {
    // { router }
    constructor({ router }) {
        this.app = express();
        
        this.middlewares();
        this.app.use(router);
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(logger('dev'));
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
    }
    
}

module.exports = App;