const jwt = require("jsonwebtoken");

class Token {
  createToken(payload) {
    let token = jwt.sign(
      payload,
      "moneywisesecretLongTokenhasbeenprovidedhere123",
      { expiresIn: "48h" }
    );
    return token;
  }

  static verifyToken(token) {
    return jwt.verify(
      token,
      "moneywisesecretLongTokenhasbeenprovidedhere123",
      (err, decoded) => {
        if (err) return err;
        else return decoded;
      }
    );
  }
}

module.exports = Token;
