const SAuth = require('sauth-token');

function facebookVerify() {
  return async function (token = '') {
    const sAuth = new SAuth({
      facebook: {
        fields: ['id', 'first_name', 'last_name', 'email', 'picture', 'gender'],
      },
    });

    const { email, picture, first_name, last_name } = await sAuth
      .driver('facebook')
      .getUserByToken(token);

    const userEntity = {
      email,
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
