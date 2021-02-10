const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: [true, "Komentarz nie może być pusty"],
  },
});

module.exports = mongoose.model("Comment", commentSchema);
