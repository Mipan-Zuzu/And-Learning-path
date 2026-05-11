const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Email: { type:String, required:true, unique:true },
  Password: { type:String, required:true },
  username : String,
  age : Number,
  job : String,
  chat : String,
  group : String
});

const chatSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  profesi: { type: String, required: true },
  pesan: { type: String, required: true },
  profileImage: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
  img: { type: String, default: ""},
  gif: { type: String, default: "" },
  gifPreview: { type: String, default: "" },
  gifOriginal: { type: String, default: "" },
  replayMsg: { type: String, default: "" },
  replayName: { type: String, default: "" },
  replayImg: { type: String, default: "" },
});

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, default: "gif" },
  nama: { type: String, default: "" },
  profesi: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model("User", userSchema),
  Chat: mongoose.model("Chat", chatSchema),
  Group: mongoose.model("Group", groupSchema),
  Image: mongoose.model("Image", imageSchema),
};

