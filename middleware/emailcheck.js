const UserModel = require("../models/Users.model");
const bcrypt = require("../utilities/Password");

// verification middleware...
exports.checkEmailAddress = async (req, res, next) => {
  const { email, password } = req.body;
  let Login = await UserModel.LoginOrExist(email);
  let result = await Login;

  if (result !== null) {
    if (!result.status)
      return res.send({ status: "failed", message: "Unverified Account!" });
    const chkPass = bcrypt.comparePass(result.password, password);
    if (chkPass) {
      req.userMetaData = { id: result.referalLink, email: result.email };
      next();
    } else res.send({ status: "failed", message: "Invalid Credentials!" });
  } else
    res.status(200).send({ status: "failed", message: "Invalid Credentials!" });
};
