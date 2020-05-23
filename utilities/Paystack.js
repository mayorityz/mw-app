require("dotenv").config();
const paystack = require("paystack")(process.env.PAYSTACK_KEY);
/**
 * handle payments from one place
 */

class Payments {
  /**
   * Initiate transaction using paystack.
   * @params {string} returnUrl - url to verify transaction after payment.
   * @params {float} amount - amount for transaction
   * @params {string} reference - required* a unique reference id for this transaction
   * @param {string} name - customer name
   * @params {string} email - customer email
   * @params {string} metadata - work with unique id we generated
   */
  async makePayment(returnUrl, amount, reference, name, email, metadata) {
    try {
      return await paystack.transaction
        .initialize({
          amount: amount * 100,
          reference,
          name,
          email,
          callback_url: returnUrl,
          metadata,
        })
        .then((response) => {
          const { status, data } = response;
          console.log(status);
          if (status === true) {
            console.log(data.authorization_url);
            return { status: "success", msg: data.authorization_url };
          } else {
            return { status: "failed", msg: "Invalid Transaction ID" };
          }
        });
    } catch (error) {
      console.log(err);
    }
  }
  /**
   * verify payment with paystack
   * @param {string} reference - transaction reference ...
   */
  static async verifyPayment(reference) {
    try {
      // I need to refactor this code ...
      return await paystack.transaction
        .verify(reference)
        .then((res) => {
          const { status, message, data } = res;
          if (status) return [message, data];
          else return status;
        })
        .catch((err) => {
          return ["an error has occured!"];
        });
    } catch (error) {
      return ["an error has occured!"];
    }
  }

  static async listBanks() {
    try {
      return await paystack.misc.list_banks().then((body, err) => {
        return body;
      });
    } catch (err) {
      return err;
    }
  }
}

module.exports = Payments;
