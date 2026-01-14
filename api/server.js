const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const { User, Chat } = require("./model/model");
const dotenv = require("dotenv")
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");


dotenv.config();

const dbUser = process.env.DB_USERNAME;
const dbPass = process.env.DB_PASSWORD;
const secretkey = process.env.AUTH_KEY;
const acctoken = process.env.ACC_TOKEN;
let token

const app = express();
const port = process.env.PORT || 5000;
const nodeEnv = process.env.NODE_ENV || 'development';
const frontendUrl = 'https://and-navy.vercel.app';

app.use(
  cors({
    origin: frontendUrl.split(',').map(url => url.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: "Terlalu banyak request dari IP ini, coba lagi nanti",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  skipSuccessfulRequests: true, 
  message: "Terlalu banyak percobaan login/register, coba lagi dalam 15 menit",
  standardHeaders: true,
  legacyHeaders: false,
});

const postLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10, 
  message: "Terlalu banyak request, tunggu beberapa saat",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

app.get("/", (req, res) => {
  res.send("home");
});

mongoose
.connect(
  `mongodb+srv://${dbUser}:${dbPass}@cluster0.kvl3gwe.mongodb.net/people`
)
.then(() => console.log("connected to mongodb"))
.catch((err) => console.error("mongodb connection error:", err));

const createUser = async (req, res) => {
  try {
    console.log("createUser request body:", req.body);
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return res
      .status(400)
      .json({ message: "Email dan Password kosong silakan isi dahulu" });
    }
    
    const newUser = new User({ Email, Password });
    const savedUser = await newUser.save();

    console.log("user saved:", savedUser._id);

    return res
      .status(201)
      .json({ message: "berhasil di tambahkan", user: savedUser });
    } catch (error) {
      console.error("createUser error:", error);
    return res
    .status(500)
      .json({ message: "gagal di tambahkan", error: error.message });
    }
  };
  
  const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "gagal mengambil data" });
  }
};

const loginCheck = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res
        .status(400)
        .json({ login: false, message: "Email dan Password kosong silakan isi dahulu" });
    }

    console.log("login attempt:", { Email });

    const user = await User.findOne({ Email, Password });
    if (!user) {
      return res.status(401).json({ login: false, message: "Email atau password salah" });
    }

    const payload = { id: user._id };
    const newToken = jwt.sign(payload, secretkey, { expiresIn: "5m" });

    res.cookie("token", newToken, {
  httpOnly: true,
  secure: nodeEnv === "production",
  sameSite: nodeEnv === "production" ? "none" : "lax",
  maxAge: 60 * 60 * 1000,
})
      .status(200)
      .json({ login: true, message: "login berhasil" });
  } catch (error) {
    console.error("loginCheck error:", error);
    return res.status(500).json({ login: false, message: "internal server error", error: error.message });
  }
};



app.get("/check-session", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ login: false });
  }

  try {
    jwt.verify(token, secretkey);
    return res.json({ login: true });
  } catch {
    return res.json({ login: false });
  }
});



app.delete("/chatDirect/:id", async (req, res) => {
  const findChat = await Chat.findByIdAndDelete (
    req.params.id,
    req.body,
    {new : true, ValidityState : true}
  )
  console.log(findChat)
  res.json(findChat)
})

// todo : socket 
// todo : socket
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")

const io = new Server(server, {
  cors: {
    origin: "https://and-navy.vercel.app",
    credentials: true
  },
  maxHttpBufferSize: 10e6, 
  pingTimeout: 60000,
  connectTimeout: 60000
})

const onlineUsers = new Map()

//! Rate limit tracker untuk socket events
const socketRateLimits = new Map()

const checkSocketRateLimit = (clientId, action, limit = 5, window = 10000) => {
  const key = `${clientId}:${action}`
  const now = Date.now()
  
  if (!socketRateLimits.has(key)) {
    socketRateLimits.set(key, [now])
    return true
  }
  
  const timestamps = socketRateLimits.get(key)
  const recentTimestamps = timestamps.filter(t => now - t < window)
  
  if (recentTimestamps.length < limit) {
    recentTimestamps.push(now)
    socketRateLimits.set(key, recentTimestamps)
    return true
  }
  
  return false
}

io.on("connection", client => {
  console.log("Client connected")

  client.on("userOnline", (userData) => {
    try {
      if (!checkSocketRateLimit(client.id, 'userOnline', 5, 10000)) {
        client.emit("error", { message: "Terlalu sering mengirim request userOnline" })
        return
      }

      const { nama, profesi, profileImage } = userData
      onlineUsers.set(client.id, { nama, profesi, profileImage })
      
      io.emit("userStatusUpdate", {
        type: "online",
        user: { nama, profesi, profileImage }
      })
      
      console.log("User online:", nama, "Total:", onlineUsers.size)
    } catch (error) {
      console.error("Error user online:", error)
    }
  })

 client.on("sendMessage", async (data) => {
  try {
    if (!checkSocketRateLimit(client.id, 'sendMessage', 10, 30000)) {
      client.emit("error", { message: "Terlalu sering mengirim pesan" })
      return
    }

    console.log("DATA DARI FE:", {
      hasImg: !!data.img,
      imgLength: data.img?.length
    })

    const { nama, profesi, pesan, profileImage, img } = data

    const newChat = new Chat({
      nama,
      profesi,
      pesan,
      profileImage,
      img
    })

    const savedChat = await newChat.save()

    io.emit("receiveMessage", savedChat)
  } catch (error) {
    console.error("Error saving chat:", error)
  }
})


  client.on("getMessages", async () => {
    try {
      //! Rate limit: max 20 getMessages per minute
      if (!checkSocketRateLimit(client.id, 'getMessages', 20, 60000)) {
        client.emit("error", { message: "Terlalu sering request pesan" })
        return
      }

      const chats = await Chat.find().sort({ timestamp: 1 })
      client.emit("allMessages", chats)
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  })


  client.on("getOnlineUsers", () => {
    try {
      if (!checkSocketRateLimit(client.id, 'getOnlineUsers', 20, 60000)) {
        client.emit("error", { message: "Terlalu sering request user online" })
        return
      }

      const users = Array.from(onlineUsers.values())
      client.emit("onlineUsersList", users)
    } catch (error) {
      console.error("Error fetching online users:", error)
    }
  })

  client.on("disconnect", () => {
    const user = onlineUsers.get(client.id)
    if (user) {
      onlineUsers.delete(client.id)
      
      const keys = Array.from(socketRateLimits.keys()).filter(k => k.startsWith(client.id))
      keys.forEach(key => socketRateLimits.delete(key))
      
      io.emit("userStatusUpdate", {
        type: "offline",
        user: user
      })
      
      console.log("User offline:", user.nama, "Total:", onlineUsers.size)
    }
  })
})

app.post("/result", authLimiter, createUser)
app.get("/api", getAllUsers)
app.post("/login", authLimiter, loginCheck)

server.listen(port, () => console.log(`listening on port :${port} [${nodeEnv}]`))