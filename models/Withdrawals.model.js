// keep the records of the withdrawals made ...
const DB = require("mongoose");

const withdrawalModel = new DB.Schema({
  investmentId: String,
  amount: Number,
  userData: Object,
  status: { type: String, default: "processing" },
  userId: String,
  date_requested: { type: Date, default: Date.now() },
});
/**
 *id, amount requested, userData, userId, status (processing/paid), date requested
 *
 */

const Withdrawals = DB.model("withdrawals", withdrawalModel);

class Withdrawal {
  /**
   * Save new withdrawals
   * @param {string} id - investment id
   * @param {number} amount - amount to withdraw
   * @param {object} userData - user object
   * @param {string} userId - user id
   */

  async save(id, amount, userData, userId) {
    let newRequest = new Withdrawals({ id, amount, userData, userId });
    return await newRequest.save();
  }
  delete() {}
  update() {}
  findById() {}

  /**
   * find a withdrawal account
   * @param {string} query - query for withdrawal
   */

  static async find(query) {
    let request = await Withdrawals.find(query);
    return request;
  }
}

module.exports = Withdrawal;
