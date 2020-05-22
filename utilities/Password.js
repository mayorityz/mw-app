const bcrypt = require("bcryptjs");

/**
 * generate an hash
 * @param {string} password - received password
 * @return hash
 */

exports.hash = (password) => {
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(password, salt);
  return hash;
};

/**
 *compare stored hash with received password.
 * @param {string} hash - existing hash
 * @param {string} password - received password
 * @return {boolean} result
 */
exports.comparePass = (hash, password) => {
  let result = bcrypt.compareSync(password, hash);
  return result;
};
