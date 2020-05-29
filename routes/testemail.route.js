const express = require("express");
const Router = express.Router();

const controller = require("../controllers/test.controller");

Router.get("/sendmail", controller.sendMail);

module.exports = Router;
