const tokenize = require("../utilities/Tokenize");

exports.userAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];
  let log = tokenize.verifyToken(token);
  if (log.name !== undefined) {
    res.status(500).send("error");
  } else {
    req.userDetails = log;
    next();
  }

  // next();
};
