require("dotenv").config();
const UserModel = require("../models/Users.model");
const hash = require("../utilities/Password");
const shortid = require("shortid");
const Tokenize = require("../utilities/Tokenize");
const Payment = require("../utilities/Paystack");

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
  const { id, email } = req.userDetails;
  const { amount, option } = req.body;
  let query = await UserModel.LoginOrExist(email);
  let result = await query;
  if (!result) return res.send("User Data Invalid");
  const { firstName, lastName } = result;

  // begin payment processing... after saving to database
  let pay = new Payment();
  let query_ = await pay.makePayment(
    `${process.env.BE_URL}/users/verifyPayment`,
    amount,
    shortid.generate(),
    `${firstName} ${lastName}`,
    email
  );
  let response = await query_;
  res.send(response);
};

exports.verifyPayment = async (req, res) => {
  // verify payment after payment
  const reference = req.query.reference;
  if (!reference)
    res.status(500).send({ status: "failed", message: "Reference Missing" });
  let query = await Payment.verifyPayment(reference);
  let response = await query;
  console.log(response);
};
