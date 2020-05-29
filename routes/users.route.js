const express = require("express");
const Router = express.Router();
const controller = require("../controllers/user.controller");

// Middleware
const LoginVerificationMiddleware = require("../middleware/emailcheck");
const authMiddleWare = require("../middleware/auth");
const storePaymentMiddleWare = require("../middleware/paymentDetails");

Router.post("/users/newaccount/:id", controller.newAccount);
Router.post("/users/newaccount", controller.newAccount);
Router.get("/users/verifyaccount/:q/:a", controller.verifyAccount);
Router.post(
  "/users/login",
  LoginVerificationMiddleware.checkEmailAddress,
  controller.login
);
Router.post(
  "/users/deposit",
  [authMiddleWare.userAuth, storePaymentMiddleWare.makePayment],
  controller.newDeposit
);
Router.get("/users/verifypayment", controller.verifyPayment);
Router.get(
  "/users/mypaymenthistory",
  authMiddleWare.userAuth,
  controller.userPaymentHistory
);
Router.get("/users/mydetails", authMiddleWare.userAuth, controller.userDetails);
Router.post(
  "/users/updatebankdetails",
  authMiddleWare.userAuth,
  controller.updateUserBankDetails
);

Router.get("/list/banks", authMiddleWare.userAuth, controller.listBanks);
Router.post(
  "/users/withdrawal",
  authMiddleWare.userAuth,
  controller.withdrawal
);
Router.post("/users/reinvest", authMiddleWare.userAuth, controller.reinvest);
Router.get("/users/verifyreinvestment", controller.verifyReinvestment);
module.exports = Router;
