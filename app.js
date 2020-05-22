const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const DataBase = require("./utilities/DATABASE");

const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

// routes
const usersRoute = require("./routes/users.route");

// use the routes
app.use(usersRoute);

/**
 * 404 handler
 */
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

/**
 * 500 handler
 */

// catch server errors and respond with 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

DataBase.then(() => {
  console.log("db is connected");
  app.listen(port, () => {
    console.log(`running on port:${port}`);
  });
}).catch((err) => {
  console.log(err);
});
