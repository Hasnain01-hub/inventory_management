const express = require("express");
const messageModal = require("../modal/message.modal");
const router = express.Router();

router.post("/chat/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  // Fetch chat history from MongoDB
  const messages = await messageModal
    .find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    })
    .sort({ timestamp: 1 });

  res.json(messages);
});

module.exports = router;
