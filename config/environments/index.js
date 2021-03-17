const fs = require('fs');

require("dotenv").config();

const { NODE_ENV } = process.env;
const currentEnv = NODE_ENV?.trim();
const fileEnv = fs.existsSync(`./${currentEnv}.js`) ? currentEnv : 'development';
const env = require(`./${fileEnv}`);

module.exports = env;

