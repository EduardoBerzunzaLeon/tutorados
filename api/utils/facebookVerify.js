const SAuth = require('sauth-token');

function facebookVerify() {
  return async function (token = '') {
    const sAuth = new SAuth({
      facebook: {
        fields: ['id', 'first_name', 'last_name', 'email', 'picture', 'gender'],
      },
    });

    const data = await sAuth
      .driver('facebook')
      .getUserByToken(token);

    const { id, picture, first_name, last_name } = data;
    const userEntity = {
      email: `${id}@facebookgenerated.com`,
      avatar: picture,
      name: {
        first: first_name,
        last: last_name,
      },
    };

    return userEntity;
  };
}
module.exports = facebookVerify;
