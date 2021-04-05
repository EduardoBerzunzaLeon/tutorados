const fs = require('fs');
const getEnviroment = require('../../helpers/getEnviroment');

require('dotenv').config();

const enviroment = getEnviroment();
const fileEnv = fs.existsSync(`./${enviroment}.js`)
  ? currentEnv
  : 'development';
const env = require(`./${fileEnv}`);

module.exports = env;
