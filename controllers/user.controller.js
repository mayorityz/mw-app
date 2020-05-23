require("dotenv").config();
const UserModel = require("../models/Users.model");
const hash = require("../utilities/Password");
const shortid = require("shortid");
const Tokenize = require("../utilities/Tokenize");
const Payment = require("../utilities/Paystack");
const PaymentRecord = require("../models/PaymentRecord.model");
exports.newAccount = async (req, res) => {
  let { id } = req.params;
  if (id === undefined) id = "";
  const uId = shortid.generate();
  const { firstName, lastName, email, phone, password, gender } = req.body;
  console.log(req.body);

  // check email doesn't already exist...
  let chkIfExists = await UserModel.LoginOrExist(email);
  let status = await chkIfExists;
  if (status !== null) return res.status(202).send("Email Already Exists");
  const passwordHashed = hash.hash(password);
  try {
    UserModel.createUser(
      firstName,
      lastName,
      email,
      phone,
      passwordHashed,
      (referalLink = uId),
      gender,
      (referal = id)
    ).then((res_) => {
      res.status(202).send("Account Created & Email Sent!");
    });
  } catch (error) {
    res.status(500).send("Database Error");
  }
};

exports.verifyAccount = async (req, res) => {
  const { q, a } = req.params;
  if (q === undefined || a === undefined)
    res.status(500).send("Invalid Verification Parameters Provided");
  try {
    let query = await UserModel.verifyAccount(q, a);
    let result = await query;
    if (result) res.status(200).send("verified");
    else res.status(500).send("invalid record");
  } catch (error) {
    res.status(500).send("database error");
  }
};

exports.login = async (req, res) => {
  let jwt = new Tokenize();
  let jwt_ = jwt.createToken(req.userMetaData);
  res.status(202).send({ status: "successful", message: jwt_ });
};

exports.newDeposit = async (req, res) => {
  const { email } = req.userDetails;

  const { amount } = req.body;
  let query = await UserModel.LoginOrExist(email);
  let result = await query;
  if (!result) return res.send("User Data Invalid");
  const { firstName, lastName } = result;
  const metadata = { custom_fields: [{ reference: req.reference }] };
  // begin payment processing... after saving to database
  let pay = new Payment();
  let query_ = await pay.makePayment(
    `${process.env.BE_URL}/users/verifyPayment`,
    amount,
    req.reference,
    `${firstName} ${lastName}`,
    email,
    metadata
  );
  let response = await query_;
  res.send(response);
};

exports.verifyPayment = async (req, res) => {
  // verify payment after payment
  const reference_ = req.query.reference;
  if (!reference_)
    res.status(500).send({ status: "failed", message: "Reference Missing" });
  let query = await Payment.verifyPayment(reference_);
  let response = await query;

  if (response[0] === "Verification successful") {
    await PaymentRecord.verifyPayment(
      response[1].metadata["custom_fields"][0]["reference"]
    );
    res.redirect(`${process.env.FE_URL}/dashboard/deposits`);
  } else res.status(500).send("Error");
};

exports.userPaymentHistory = async (req, res) => {
  const { id } = req.userDetails;
  let request = await PaymentRecord.myPayment(id);
  res.status(200).send(await request);
};

exports.userDetails = async (req, res) => {
  const { email } = req.userDetails;
  let query = await UserModel.LoginOrExist(email);
  let response = await query;
  res.status(200).send(response);
};

exports.updateUserBankDetails = async (req, res) => {
  const { email } = req.userDetails;
  const { bank, type, account } = req.body;
  let query = await UserModel.updateBankDetails(email, bank, type, account);
  let response = await query;
  res.status(200).send("updated successfully");
};

exports.listBanks = async (req, res) => {
  let banks = await Payment.listBanks();
  if (banks.status) {
    res.status(200).send(banks.data);
  }
};
