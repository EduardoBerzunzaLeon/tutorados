const container = require('./api/container');

const Startup = container.resolve('Startup');

Startup.start().catch(err => {
    console.log(err);
});