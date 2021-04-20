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
          user: this.config.EMAIL.SENDGRID_USERNAME,
          pass: this.config.EMAIL.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: this.config.EMAIL.EMAIL_HOST,
      port: this.config.EMAIL.EMAIL_PORT,
      auth: {
        user: this.config.EMAIL.EMAIL_USERNAME,
        pass: this.config.EMAIL.EMAIL_PASSWORD,
      },
    });
  }

  createEmail(user) {
    this.mailOptions = {
      to: user.email,
      firstName: user.name.first.split(' ')[0],
      from: `Tutorado app <${this.config.EMAIL.EMAIL_FROM}>`,
    };
    return this;
  }
  // Send the actual email
  async sendEmail(template, subject, ...args) {
    // 1) Render HTML based
    const html = this.emailTemplates[template](...args);

    // 2) Define email options
    const mailOptionsSen = { ...this.mailOptions, subject, html };

    // 3) Create a transport and send email
    await this.createTransport().sendMail(mailOptionsSen);
  }

  async sendWelcome(url) {
    await this.sendEmail('welcome', 'Welcome to the tutorados app!', url);
  }

  async sendPasswordReset(url) {
    await this.sendEmail(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
      url
    );
  }
}

module.exports = EmailService;
