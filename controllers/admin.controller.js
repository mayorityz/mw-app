require("dotenv").config();

const UserModel = require("../models/Users.model");
const WithdrawlsModel = require("../models/Withdrawals.model");
const PaymentRecordModel = require("../models/PaymentRecord.model");

exports.withdrawalsRequest = async (req, res, next) => {
  let requests = await WithdrawlsModel.find({});
  res.status(200).json(requests);
};

exports.allUsers = async (req, res, next) => {
  let requests = await UserModel.users({});
  res.status(200).json(requests);
};

/**
 * payment records
 * user via userid
 * user history
 */

exports.paymentRecords = async (req, res, next) => {
  let request = await PaymentRecordModel.findPayment({});
  res.status(200).send(request);
};

exports.dashboard = async (req, res, next) => {
  let request1 = await WithdrawlsModel.find({});
  let request2 = await UserModel.users({});
  let request3 = await PaymentRecordModel.findPayment({});

  const list = [request1, request2, request3];
  res.status(200).json(list);
};
