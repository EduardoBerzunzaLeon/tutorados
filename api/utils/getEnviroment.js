module.exports = () => {
  const { NODE_ENV } = process.env;
  const currentEnv = NODE_ENV?.trim();
  return currentEnv !== undefined ? currentEnv : 'development';
};
