require("dotenv").config();
const db = require("mongoose");
const connection = db.connect(process.env.DBURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

module.exports = connection;
