const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function googleVerify(token = '') {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
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
}

module.exports = googleVerify;
