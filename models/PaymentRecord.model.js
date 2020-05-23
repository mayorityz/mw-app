const DB = require("mongoose");

const paymentModel = new DB.Schema({
  userid: String,
  amount: Number,
  type: String,
  refid: String,
  createdWhen: { type: Date, default: Date.now },
  status: { type: String, default: "Ongoing" },
  history: Array,
  payment: { type: String, default: "unverified" },
  withdrawalsLeft: { type: Number, default: 0 },
  reference: String,
});

const Payment = DB.model("moneypayments", paymentModel);

class PaymentTemplate {
  /**
   * Save a new unverified payment
   * @param {string} userid - Payer's id
   * @param {float} amount - Amount Paid
   * @param {string} type - Investment Type
   * @param {string} reference - payment reference
   */
  async newPayment(userid, amount, type, reference) {
    const document = { userid, amount, type, reference };
    let makePayment = new Payment(document);
    try {
      return await makePayment.save();
    } catch (error) {
      return error;
    }
  }
  /**
   * update/verify payment
   * @param {string} reference - reference id of transaction from paystack
   */
  static async verifyPayment(reference) {
    const condition = { reference: reference };
    const update = { payment: "completed" };
    return await Payment.findOneAndUpdate(condition, update);
  }

  /**
   * User Payment Record
   * @param {string} id - user id
   */

  static async myPayment(id) {
    return await Payment.find({ userid: id, payment: "completed" });
  }
}

module.exports = PaymentTemplate;
