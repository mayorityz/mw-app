const DB = require("mongoose");

const paymentModel = new DB.Schema({
  userid: String,
  amount: Number,
  type: String,
  refid: String,
  createdWhen: { type: Date, default: Date.now },
  nextDue: Date,
  status: { type: String, default: "Ongoing" },
  history: Array,
  payment: { type: String, default: "unverified" },
  withdrawalsLeft: { type: Number, default: 0 },
  reference: String,
  wallet: { type: Number, default: 0 },
});

const Payment = DB.model("moneypayments", paymentModel);

const moment = require("moment");

const add14days = (days) => {
  return moment().add(days, "days").format();
};

class PaymentTemplate {
  /**
   * Save a new unverified payment
   * @param {string} userid - Payer's id
   * @param {float} amount - Amount Paid
   * @param {string} type - Investment Type
   * @param {string} reference - payment reference
   * @param {string} nextDue - Due returns for each deposit
   */
  async newPayment(userid, amount, type, reference, nextDue) {
    const document = { userid, amount, type, reference, nextDue };
    let makePayment = new Payment(document);
    try {
      return await makePayment.save();
    } catch (error) {
      return error;
    }
  }
  /**
   * update/verify payment -upon withdrawl
   * @param {string} reference - reference id of transaction from paystack
   */
  static async verifyPayment(reference) {
    const condition = { reference: reference };
    const update = { payment: "completed" };
    return await Payment.findOneAndUpdate(condition, update);
  }

  /**
   * update/verify reinvestment
   * @param {string} reference - reference id of transaction from paystack
   */
  static async verifyReinvestment(reference, update) {
    const condition = { reference };
    return await Payment.findOneAndUpdate(condition, update);
  }

  /**
   * User Payment Record
   * @param {string} id - user id
   */

  static async myPayment(id) {
    return await Payment.find({
      userid: id,
      payment: "completed",
      status: { $ne: "Completed" },
    });
  }

  /**
   * A dynamic find for single records
   *
   */
  static async findPayment(query) {
    return await Payment.find(query);
  }

  static async updateRecord(options, query) {
    return await Payment.findOneAndUpdate(options, query);
  }
}

module.exports = PaymentTemplate;
