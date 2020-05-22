const express = require("express");
const Router = express.Router();
const controller = require("../controllers/user.controller");

// Middleware
const LoginVerificationMiddleware = require("../middleware/emailcheck");
const authMiddleWare = require("../middleware/auth");

Router.post("/users/newaccount/:id", controller.newAccount);
Router.post("/users/newaccount", controller.newAccount);
Router.get("/users/verifyaccount/:q/:a", controller.verifyAccount);
Router.post(
  "/users/login",
  LoginVerificationMiddleware.checkEmailAddress,
  controller.login
);
Router.post("/users/deposit", authMiddleWare.userAuth, controller.newDeposit);
Router.get("/users/verifypayment", controller.verifyPayment);
module.exports = Router;
