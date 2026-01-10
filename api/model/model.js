const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  Email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  Password: { type: String, required: true },
  username: { type: String, default: "" },
  age: { type: Number, default: null },
  job: { type: String, default: "" },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("Password")) {
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.Password);
};

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  nama: { type: String, required: true, trim: true },
  profesi: { type: String, required: true, trim: true },
  pesan: { type: String, required: true, trim: true, maxlength: 2000 },
  profileImage: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
  img: { type: String, default: "" },
});

chatSchema.index({ userId: 1, timestamp: -1 });

const todoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  image: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, 
});

module.exports = {
  User: mongoose.model("User", userSchema),
  Chat: mongoose.model("Chat", chatSchema),
  Todo: mongoose.model("Todo", todoSchema),
  Group: mongoose.model("Group", groupSchema),
};
