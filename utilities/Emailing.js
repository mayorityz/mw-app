require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.MAIL_KEY);

class SendGrid {
  static async sendMail(to, body, subject) {
    const msg = {
      to,
      from: "noreply@moneychain.org",
      subject,
      html: `<span>${body}</span>`,
    };
    //ES6
    return await sgMail.send(msg);
  }
}

module.exports = SendGrid;
