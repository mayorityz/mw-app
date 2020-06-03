const express = require("express");

const Router = express.Router();

const AdminController = require("../controllers/admin.controller");

Router.get("/withdrawals", AdminController.withdrawalsRequest);
Router.get("/users", AdminController.allUsers);
Router.get("/paymentrecord", AdminController.paymentRecords);
Router.get("/dashboard", AdminController.dashboard);

module.exports = Router;
