const Mailer = require("../utilities/Emailing");

exports.sendMail = async (req, res) => {
  let e = await Mailer.sendInBlue();
  console.log(e);
  res.send("Sent!");
};
