const express = require("express");
const path = require("path");
// const passport = require("passport");
var session = require("express-session");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
//app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

//database
mongoose
  .connect(process.env.MONGODB_URI || "", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true, // Enable this option
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

// app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve files from 'uploads' directory

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);
const db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to MongoDB");
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join private room for one-to-one communication
  socket.on("joinRoom", ({ user1, user2 }) => {
    const room = [user1, user2].sort().join("_");
    socket.join(room);
    console.log(`${socket.id} joined room: ${room}`);
  });

  // Send message
  socket.on("sendMessage", async ({ sender, receiver, message }) => {
    const room = [sender, receiver].sort().join("_");

    // Save the message in MongoDB
    const newMessage = new messageModal({ sender, receiver, message });
    await newMessage.save();

    // Emit the message to the room
    io.to(room).emit("receiveMessage", {
      sender,
      message,
      timestamp: newMessage.timestamp,
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// app.use(passport.initialize());
// Importing Routes
const authRoute = require("./route/auth.route");
const inventoryRoute = require("./route/warehouse.route");
const messageModal = require("./modal/message.modal");
app.use("/api", inventoryRoute);
app.use("/api", require("./route/order.route"));
app.use("/api", require("./route/purchase.route"));
app.use("/api", require("./route/sale.route"));
app.use("/api", require("./route/expenses.route"));
app.use("/api", require("./route/customer.route"));
app.use("/api", require("./route/inventory.route"));
app.use("/api", require("./route/return.route"));
app.use("/api", require("./route/supplier.route"));
app.use("/api", require("./route/shipment.route"));
app.use("/api", require("./route/message.route"));
app.use("/api/auth", authRoute);

app.use("/", function (req, res) {
  res.send("Server running");
});

//port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Server is Running");
});
