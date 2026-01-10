require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");

const { User, Chat } = require("./model/model");

const dbUser = process.env.DB_USERNAME;
const dbPass = process.env.DB_PASSWORD;
const secretkey = process.env.AUTH_KEY; 
const acctoken = process.env.ACC_TOKEN || "tokens";

const local_frontend = "http://localhost:5173";
const pub_frontend = "https://and-navy.vercel.app";

const nodeEnv = process.env.NODE_ENV || "development";
const frontendUrl = nodeEnv === "development" ? local_frontend : pub_frontend;

const app = express();
const server = http.createServer(app);


app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: "Terlalu banyak request dari IP ini, coba lagi nanti",
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: "Terlalu banyak percobaan login/register",
});
app.use(generalLimiter);

mongoose
  .connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.kvl3gwe.mongodb.net/people`)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.get("/", (req, res) => res.send("Home"));

app.post("/result", authLimiter, async (req, res) => {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password)
      return res.status(400).json({ message: "Email dan Password harus diisi" });

    const newUser = new User({ Email, Password });
    const savedUser = await newUser.save();

    res.status(201).json({ message: "User berhasil ditambahkan", user: savedUser });
  } catch (error) {
    console.error("createUser error:", error);
    res.status(500).json({ message: "Gagal menambahkan user", error: error.message });
  }
});

app.get("/api", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data" });
  }
});

app.post("/login", authLimiter, async (req, res) => {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password)
      return res.status(400).json({ login: false, message: "Email dan Password harus diisi" });

    const user = await User.findOne({ Email, Password });
    if (!user) return res.status(401).json({ login: false, message: "Email atau password salah" });

    const payload = { id: user._id };
    const newToken = jwt.sign(payload, secretkey, { expiresIn: "5m" });

    res.cookie(acctoken, newToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 5 * 60 * 1000,
    }).status(200).json({ login: true, message: "Login berhasil" });
  } catch (error) {
    console.error("loginCheck error:", error);
    res.status(500).json({ login: false, message: "Internal server error", error: error.message });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie(acctoken, { path: "/" });
  res.json({ message: "Cookie cleared" });
});

app.get("/check-session", (req, res) => {
  try {
    const token = req.cookies[acctoken];
    if (!token) return res.status(200).json({ login: false });

    const decoded = jwt.verify(token, secretkey);
    return res.status(200).json({ login: true, user: decoded });
  } catch (err) {
    console.error("JWT verify error in /check-session:", err);
    return res.status(200).json({ login: false });
  }
});

const io = new Server(server, {
  cors: { origin: frontendUrl, credentials: true },
});

const onlineUsers = new Map();
const socketRateLimits = new Map();

const checkSocketRateLimit = (clientId, action, limit = 5, window = 10000) => {
  const key = `${clientId}:${action}`;
  const now = Date.now();
  if (!socketRateLimits.has(key)) {
    socketRateLimits.set(key, [now]);
    return true;
  }
  const timestamps = socketRateLimits.get(key);
  const recent = timestamps.filter((t) => now - t < window);
  if (recent.length < limit) {
    recent.push(now);
    socketRateLimits.set(key, recent);
    return true;
  }
  return false;
};

io.on("connection", (client) => {
  console.log("Client connected:", client.id);

  client.on("userOnline", (userData) => {
    if (!checkSocketRateLimit(client.id, "userOnline", 10, 10000)) {
      client.emit("error", { message: "Terlalu sering mengirim request userOnline" });
      return;
    }
    onlineUsers.set(client.id, userData);
    io.emit("userStatusUpdate", { type: "online", user: userData });
  });

  client.on("sendMessage", async (data) => {
    try {
      if (!checkSocketRateLimit(client.id, "sendMessage", 10, 30000)) {
        client.emit("error", { message: "Terlalu sering mengirim pesan" });
        return;
      }

      const cookieHeader = client.handshake.headers.cookie || "";
      const tokenCookie = cookieHeader.split("; ").find((c) => c.startsWith(`${acctoken}=`));
      if (!tokenCookie) return client.emit("error", { message: "User not authenticated" });
      const token = tokenCookie.split("=")[1];

      let decoded;
      try {
        decoded = jwt.verify(token, secretkey);
      } catch (err) {
        return client.emit("error", { message: "Invalid token" });
      }

      const { pesan, nama, profesi, profileImage } = data;
      const newChat = new Chat({ userId: decoded.id, pesan, nama, profesi, profileImage });
      await newChat.save();

      io.emit("receiveMessage", { userId: decoded.id, pesan, nama, profesi, profileImage, timestamp: new Date() });
    } catch (error) {
      console.error("Error saving chat:", error);
      client.emit("error", { message: "Gagal menyimpan chat" });
    }
  });

  client.on("getMessages", async () => {
    if (!checkSocketRateLimit(client.id, "getMessages", 20, 60000)) return;
    const chats = await Chat.find().sort({ timestamp: 1 });
    client.emit("allMessages", chats);
  });

  client.on("getOnlineUsers", () => {
    if (!checkSocketRateLimit(client.id, "getOnlineUsers", 20, 60000)) return;
    const users = Array.from(onlineUsers.values());
    client.emit("onlineUsersList", users);
  });

  client.on("disconnect", () => {
    const user = onlineUsers.get(client.id);
    if (user) {
      onlineUsers.delete(client.id);
      const keys = Array.from(socketRateLimits.keys()).filter((k) => k.startsWith(client.id));
      keys.forEach((k) => socketRateLimits.delete(k));
      io.emit("userStatusUpdate", { type: "offline", user });
    }
  });
});

app.delete("/chatDirect/:id", async (req, res) => {
  try {
    const deleted = await Chat.findByIdAndDelete(req.params.id);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ message: "Gagal hapus chat", error: err.message });
  }
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server running on port ${port} [${nodeEnv}]`));
