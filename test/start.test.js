const mongoose = require('mongoose');
const container = require('../api/startup/container');

const Startup = container.resolve('Startup');
const FileService = container.resolve('FileService');
const { PATH_AVATAR_UPLOAD } = container.resolve('config');

let server;

before(async () => {
  const [serverStart] = await Promise.all([
    Startup.start(),
    FileService.clearDir(PATH_AVATAR_UPLOAD),
  ]);

  server = serverStart;
});

after(() => {
  server.close();
  mongoose.connection.close();
});
