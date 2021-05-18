const container = require('./api/startup/container');

const Startup = container.resolve('Startup');

Startup.start().catch(console.log);
