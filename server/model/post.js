const mongoose = require("mongoose");

const postschema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  filepath: {
    type: String,
  },
  bio: {
    type: String,
    default: "",
  },
  likes: {
    // type: Map,
    // of: Boolean,
    type: Number,
    default: 0,
  },
  comments: {
    type: [String],
    default: [],
  },
});

const post = mongoose.model("post", postschema);

module.exports = post;
