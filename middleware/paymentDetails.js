// store users info before payment processing ...
const PaymentModel = require("../models/PaymentRecord.model");
const shortid = require("shortid");

exports.makePayment = async (req, res, next) => {
  const paymentReference = shortid.generate();
  req.reference = paymentReference;
  const { id } = req.userDetails;
  const { amount, option } = req.body;

  let newRecord = new PaymentModel();
  let request = await newRecord.newPayment(
    id,
    amount,
    option,
    paymentReference
  );
  let response = await request;

  if (response === null) return res.status(500).send("error");

  next();
};
