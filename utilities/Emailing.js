require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.MAIL_KEY);

var SibApiV3Sdk = require("sib-api-v3-sdk");
var defaultClient = SibApiV3Sdk.ApiClient.instance;

const mailer = require("nodemailer");

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

  static async withNodeMailer() {
    var transporter = await mailer.createTransport({
      service: "smtp-relay.sendinblue.com",
      auth: {
        user: "mayority11@gmail.com",
        pass: "ptaHvV2zn9EL7BfM",
      },
    });

    var mailOptions = {
      from: "mayority11@gmail.com",
      to: "zaroaringlamb@gmail.com",
      subject: "Sending Email using Node.js",
      text: "That was easy!",
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }

  static sendInBlue() {
    // Configure API key authorization: api-key
    var apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey =
      "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";

    // Uncomment below two lines to configure authorization using: partner-key
    // var partnerKey = defaultClient.authentications['partner-key'];
    // partnerKey.apiKey = 'YOUR API KEY';

    var apiInstance = new SibApiV3Sdk.SMTPApi();

    var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

    sendSmtpEmail = {
      to: [
        {
          email: "zaroaringlamb@gmail.com",
          name: "Abiodun Mayowa",
        },
      ],
      templateId: 1,
      params: {
        name: "John",
        surname: "Doe",
      },
      headers: {
        "X-Mailin-custom":
          "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
      },
    };

    apiInstance.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        console.log("API called successfully. Returned data: " + data);
      },
      function (error) {
        console.error(error);
      }
    );
  }
}

module.exports = SendGrid;
