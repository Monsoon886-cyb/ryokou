const nodemailer = require('nodemailer');
const postmark = require('postmark');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url, extra1, extra2) {
    this.to = user.email;
    this.name = user.name.split(' ')[0];
    this.url = url;
    this.extra1 = extra1;
    this.extra2 = extra2;
    this.from = `Monsoon <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Postmark
      return new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.name,
      url: this.url,
      subject,
    });

    if (process.env.NODE_ENV === 'production') {
      const mailOptions = {
        From: this.from,
        To: this.to,
        Subject: subject,
        HtmlBody: html,
        TextBody: htmlToText(html),
      };

      return await this.newTransport().sendEmail(mailOptions);
    }

    // Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };
    // 3) Actually send the email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendbooked(template, subject, bookings, tour) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.name,
      url: this.url,
      subject,
      bookings,
      tour,
    });

    if (process.env.NODE_ENV === 'production') {
      const mailOptions = {
        From: this.from,
        To: this.to,
        Subject: subject,
        HtmlBody: html,
        TextBody: htmlToText(html),
      };

      return await this.newTransport().sendEmail(mailOptions);
    }

    // Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };
    // 3) Actually send the email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Ryokou Family!');
  }
  async sendPasswordReset() {
    await this.send('passwordReset', 'Password Reset Request');
  }
  async sendBooked() {
    await this.sendbooked(
      'bookingConfirmation',
      'Booked Successfully',
      this.extra1,
      this.extra2
    );
  }
};
