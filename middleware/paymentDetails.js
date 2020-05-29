// store users info before payment processing ...
const PaymentModel = require("../models/PaymentRecord.model");
const shortid = require("shortid");
const calc = require("../utilities/SortPayment");
const moment = require("moment");

const add14days = (days) => {
  return moment().add(days, "days").format();
};

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
    paymentReference,
    add14days(14)
  );
  let response = await request;

  if (response === null) return res.status(500).send("error");

  next();
};
