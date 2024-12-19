const express = require("express");
const path = require("path");
// const passport = require("passport");
var session = require("express-session");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();

//app
const app = express();

//database
mongoose
  .connect(process.env.MONGODB_URI || "", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })

  .then(() => console.log("DB CONNECTED"))
  .catch((err) => console.log("DB CONNECTION ERR", err));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.set("trust proxy", 1);
app.use(morgan("common"));

app.use(bodyParser.json({ limit: "500mb" }));

app.use(
  cors({
    origin: "http://localhost:3000", // Allows access from this origin
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve files from 'uploads' directory

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

// app.use(passport.initialize());
// Importing Routes
const authRoute = require("./route/auth.route");

app.use("/api/auth", authRoute);

app.use("/", function (req, res) {
  res.send("Server running");
});

//port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Server is Running");
});
