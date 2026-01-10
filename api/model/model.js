const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Email: { type:String, required:true, unique:true },
  Password: { type:String, required:true },
  username : String,
  age : Number,
  job : String
});


const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  nama: { type: String, required: true },
  profesi: { type: String, required: true },
  pesan: { type: String, required: true },
  profileImage: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
  img: { type: String, default: "" }
});

const todoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model("User", userSchema),
  Chat: mongoose.model("Chat", chatSchema),
  Todo: mongoose.model("Todo", todoSchema),
  Group: mongoose.model("Group", groupSchema)
};

