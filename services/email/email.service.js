const nodemailer = require('nodemailer');

class EmailService {
  constructor({ config, getEnviroment, EmailTemplates }) {
    this.config = config;
    this.enviroment = getEnviroment;
    this.emailTemplates = EmailTemplates;
    this.transport = this.createTransport();
    this.mailOptions = {};
  }

  createTransport() {
    if (this.enviroment === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: this.config.email.SENDGRID_USERNAME,
          pass: this.config.email.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: this.config.email.EMAIL_HOST,
      port: this.config.email.EMAIL_PORT,
      auth: {
        user: this.config.email.EMAIL_USERNAME,
        pass: this.config.email.EMAIL_PASSWORD,
      },
    });
  }

  createEmail(user) {
    this.mailOptions = {
      to: user.email,
      firstName: user.name.split(' ')[0],
      subject,
      from: `Tutorado app <${this.config.email.EMAIL_FROM}>`,
    };
    return this;
  }
  // Send the actual email
  async sendEmail(template, subject, ...args) {
    // 1) Render HTML based
    const html = this.emailTemplates[template](...args);

    // 2) Define email options
    const mailOptionsSen = { ...mailOptions, subject, html };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptionsSen);
  }

  async sendWelcome(refreshToken) {
    await this.sendEmail(
      'welcome',
      'Welcome to the tutorados app!',
      refreshToken
    );
  }

  async sendPasswordReset(url) {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
      url
    );
  }
}

module.exports = EmailService;
