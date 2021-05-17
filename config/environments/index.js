const fs = require('fs');
const getEnviroment = require('../../api/utils/getEnviroment');

require('dotenv').config();

const enviroment = getEnviroment();

const fileEnv = fs.existsSync(`./${enviroment}.js`)
  ? currentEnv
  : 'development';
console.log(fs.existsSync(`./test.js`));
const env = require(`./${fileEnv}`);

module.exports = env;
