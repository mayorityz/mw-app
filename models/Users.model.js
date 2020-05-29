const DB = require("mongoose");

const userSchema = new DB.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: { type: Number, default: "" },
  password: String,
  gender: String,
  createdWhen: { type: Date, default: Date.now },
  status: { type: Boolean, default: false },
  referalLink: String,
  referal: String,
  Balance: { type: Number, default: 0 },
  bank: String,
  account: String,
  type: String,
});

const User = DB.model("moneyusers", userSchema);

class UserClass {
  /**
   * create a new user account
   * @param {string} firstName - user's first name
   * @param {string} lastName - user's last name
   * @param {string} email - user's email
   * @param {number} phone - user's phone number
   * @param {string} password - user's password
   * @param {string} referalLink - created user's own referal link
   * @param {string} gender - user's gender
   * @param {string} referal - Who referred the user? * default empty string
   */
  static async createUser(
    firstName,
    lastName,
    email,
    phone,
    password,
    referalLink,
    gender,
    referal = ""
  ) {
    const data = {
      firstName,
      lastName,
      email,
      password,
      gender,
      phone,
      referalLink,
      referal,
    };

    try {
      let newUser = new User(data);
      return await newUser.save();
    } catch (error) {
      return error;
    }
  }

  /**
   * Login user or check email
   * @param {string} email -Login email Address
   * @param {string} password - Login Password : empty string just to verify email, hashed to login
   */

  static async LoginOrExist(email, password = "") {
    let data;
    if (password) data = { email, password };
    // used to login
    else data = { email }; // used to check email for existance b4 reg
    return await User.findOne(data);
  }

  /**
   * set account To Active
   * @param {string} email - email
   * @param {string} referalLink - passwordHashed
   */

  static async verifyAccount(email, referalLink) {
    //   check that email and passExists
    const option = { email, referalLink, status: false };
    return await User.findOneAndUpdate(option, { status: true });
  }

  static async updateBankDetails(email, bank, type, account) {
    const option = { email, status: true };
    return await User.findOneAndUpdate(option, { bank, type, account });
  }

  static async updateUserAccount(conditions, query) {
    return await User.findOneAndUpdate(conditions, query);
  }
}

module.exports = UserClass;
