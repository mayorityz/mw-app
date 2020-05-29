require("dotenv").config();
const UserModel = require("../models/Users.model");
const hash = require("../utilities/Password");
const shortid = require("shortid");
const Tokenize = require("../utilities/Tokenize");
const Payment = require("../utilities/Paystack");
const PaymentRecord = require("../models/PaymentRecord.model");
const WithdrawalModel = require("../models/Withdrawals.model");
const Mailer = require("../utilities/Emailing");

const moment = require("moment");

const add14days = (days) => {
  return moment().add(days, "days").format();
};

// utilties
const calculateBalance = require("../utilities/SortPayment");

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
    ).then(async (res_) => {
      const message = `Hi ${firstName},
      <p>You have successfully created an account on moneychain.org</p>
      <p>Thank you for joining us!</p>
      <p>Click the link below to verify & activate your account</p>
      <a href="${process.env.FE_URL}/users/verifyaccount?q=${email}&a=${uId}">Verify Account</a>
      <p>Thank you for joining.</p>
      `;
      await Mailer.sendMail(email, message, "Money Chain: New Verification");
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
    if (result) res.status(200).send("account verified!");
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

exports.withdrawal = async (req, res) => {
  const { id, email } = req.userDetails;
  const { data } = req.body;
  if (data.status !== "Ongoing") return res.send("You have not reinvested!");

  let chk = calculateBalance.sortOutPayment(data.withdrawalsLeft, data.amount); //returns the amount due at this stage.

  const balance = chk - data.amount;

  let reqq = await UserModel.LoginOrExist(email);

  const newBalance = data.amount + reqq.Balance;
  await UserModel.updateUserAccount(
    { referalLink: id },
    { Balance: newBalance }
  );

  await PaymentRecord.updateRecord(
    { reference: data.reference, status: "Ongoing" },
    {
      withdrawalsLeft: data.withdrawalsLeft + 1,
      wallet: data.wallet + balance,
      status: "next stage",
    }
  );

  let newWithDrawal = new WithdrawalModel();
  await newWithDrawal.save(
    data.reference,
    data.amount,
    { firstName: data.firstName, lastName: data.lastName, email },
    id
  );

  // !todo : refresh the page after investment or split rows in a separate component
  // save record to withdrawal history

  res.send("All Done!!!");
};

/**
 * initiates the reinvestment portal...
 */
exports.reinvest = async (req, res) => {
  const { email } = req.userDetails;
  const { data } = req.body;
  const { withdrawalsLeft, amount, reference } = data;
  const metadata = { custom_fields: [{ reference }] };
  let nextPayment = calculateBalance.nextPayment(withdrawalsLeft, amount);

  const PaymentInit = new Payment();
  const pay = await PaymentInit.makePayment(
    `${process.env.BE_URL}/users/verifyreinvestment`,
    nextPayment,
    shortid.generate(),
    "name",
    email,
    metadata
  );

  res.status(202).send(pay);

  /**
   * know the next payment
   *
   * requires payment getway
   * !todo --->=>
   * changing the status to ongoing
   * change to completed if three
   * set wallet to zero in paymentHistory
   * set next due by 14days
   * how much to reinvest?
   */
};

exports.verifyReinvestment = async (req, res) => {
  const reference_ = req.query.reference;
  if (!reference_)
    res.status(500).send({ status: "failed", message: "Reference Missing" });

  let query = await Payment.verifyPayment(reference_);
  let response = await query;
  const investMentRef = response[1].metadata["custom_fields"][0]["reference"];

  const withdrawalsLeft = await PaymentRecord.findPayment({
    reference: investMentRef,
  });

  if (response[0] === "Verification successful") {
    if (withdrawalsLeft[0]["withdrawalsLeft"] === 3)
      await PaymentRecord.verifyReinvestment(investMentRef, {
        status: "Completed",
      });
    else
      await PaymentRecord.verifyReinvestment(investMentRef, {
        status: "Ongoing",
        nextDue: add14days(14),
      });
    res.redirect(`${process.env.FE_URL}/dashboard/deposits`);
  } else res.status(500).send("Error");
};
