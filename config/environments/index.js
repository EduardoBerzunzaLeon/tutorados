const fs = require('fs');
const path = require('path');
const getEnviroment = require('../../api/utils/getEnviroment');

require('dotenv').config();

const enviroment = getEnviroment();
const pathJoin = path.join(__dirname, `/${enviroment}.js`);
const fileEnv = fs.existsSync(pathJoin) ? enviroment : 'development';

module.exports = require(`./${fileEnv}`);
