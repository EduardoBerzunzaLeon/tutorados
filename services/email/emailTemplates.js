class EmailTemplates {
  welcome(url) {
    return `
        <div>
          <b>Please click below link to activate your account</b>
        </div>
        <div>
          <a href="${url}">Activate</a>
        </div>
        `;
  }

  passwordReset(url) {
    return `
        <div>
          <b>Please click below link to reset your password</b>
        </div>
        <div>
          <a href="${url}">Reset</a>
        </div>
        `;
  }
}

module.exports = EmailTemplates;
