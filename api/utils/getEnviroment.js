const getEnviroment = () => {
  const { NODE_ENV } = process.env;
  const currentEnv = NODE_ENV?.trim();
  return typeof currentEnv !== undefined ? currentEnv : 'development';
};

module.exports = getEnviroment;
