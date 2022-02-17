const { OAuth2Client } = require('google-auth-library');

function googleVerify({ config }) {
  const cliendId = config.GOOGLE.CLIENT_ID;

  return async function (token = '') {
    const client = new OAuth2Client(cliendId);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: cliendId,
    });

    const { email, picture, given_name, family_name } = ticket.getPayload();
    const userEntity = {
      email,
      avatar: picture,
      name: {
        first: given_name,
        last: family_name,
      },
    };

    return userEntity;
  };
}
module.exports = googleVerify;
