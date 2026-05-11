const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const { User, Chat, Image } = require("./model/model");
const dotenv = require("dotenv")
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const axios = require("axios");
const { Redis } = require("@upstash/redis");


dotenv.config();

const dbUser = process.env.DB_USERNAME;
const dbPass = process.env.DB_PASSWORD;
const secretkey = process.env.AUTH_KEY;

const app = express();
const port = process.env.PORT || 5000;
const nodeEnv = process.env.NODE_ENV || 'development';
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = frontendUrl.split(",").map((url) => url.trim());
const isProduction = nodeEnv === "production";
const userCacheTtlMs = 30 * 1000;
const messageCacheTtlMs = 15 * 1000;

let usersCache = { data: null, expiresAt: 0 };
let messagesCache = { data: null, expiresAt: 0 };

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
const redisEnabled = Boolean(redisUrl && redisToken);
const redisChatKey = "chat:recent:v1";
const redisChatMirrorKey = "chat_recent";
const redisChatMaxItems = 120;
const redisChatTtlSeconds = 60 * 60 * 6;
const redisMaxSerializedBytes = 35 * 1024;
const redisMaxFieldBytes = 4096;

const redisClient = redisEnabled
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

const trimField = (value, maxBytes = redisMaxFieldBytes) => {
  if (typeof value !== "string") return "";
  const valueBytes = Buffer.byteLength(value, "utf8");
  if (valueBytes <= maxBytes) return value;
  return "";
};

const safeRedisMessage = (message) => {
  const safeProfileImage =
    typeof message.profileImage === "string" &&
    message.profileImage.startsWith("data:")
      ? ""
      : trimField(message.profileImage || "");

  const safeMessage = {
    _id: message._id || message.tempId || "",
    nama: message.nama || "",
    profesi: message.profesi || "",
    pesan: trimField(message.pesan || "", 8192),
    profileImage: safeProfileImage,
    timestamp: message.timestamp || new Date().toISOString(),
    // Keep redis payload tiny: skip heavy/base64 image fields
    img: "",
    gif: trimField(message.gif || ""),
    gifPreview: trimField(message.gifPreview || ""),
    gifOriginal: trimField(message.gifOriginal || ""),
    replayMsg: trimField(message.replayMsg || "", 2048),
    replayName: trimField(message.replayName || "", 256),
    replayImg: "",
  };

  return safeMessage;
};

const shouldCacheMessage = (message) => {
  try {
    const serialized = JSON.stringify(safeRedisMessage(message));
    return Buffer.byteLength(serialized, "utf8") <= redisMaxSerializedBytes;
  } catch {
    return false;
  }
};

const trimRedisListToMax = async (key, maxItems) => {
  const len = await redisClient.llen(key);
  const overflow = Math.max(0, Number(len || 0) - maxItems);
  for (let i = 0; i < overflow; i += 1) {
    await redisClient.lpop(key);
  }
  return Number(len || 0) - overflow;
};

const pushMessageToRedis = async (message) => {
  if (!redisEnabled || !redisClient) return;
  if (!shouldCacheMessage(message)) return;

  const payload = JSON.stringify(safeRedisMessage(message));
  const lenMain = await redisClient.rpush(redisChatKey, payload);
  const lenMirror = await redisClient.rpush(redisChatMirrorKey, payload);
  const keptMain = await trimRedisListToMax(redisChatKey, redisChatMaxItems);
  const keptMirror = await trimRedisListToMax(redisChatMirrorKey, redisChatMaxItems);
  await redisClient.expire(redisChatKey, redisChatTtlSeconds);
  await redisClient.expire(redisChatMirrorKey, redisChatTtlSeconds);

  return {
    lenMain: Number(lenMain || 0),
    lenMirror: Number(lenMirror || 0),
    keptMain,
    keptMirror,
  };
};

const getMessagesFromRedis = async (limit) => {
  if (!redisEnabled || !redisClient) return null;

  const safeLimit = Math.max(20, Math.min(limit, redisChatMaxItems));
  const startIndex = -safeLimit;
  const rawList = await redisClient.lrange(redisChatKey, startIndex, -1);

  if (!Array.isArray(rawList) || rawList.length === 0) return [];

  const parsed = [];
  for (const rawItem of rawList) {
    try {
      parsed.push(JSON.parse(rawItem));
    } catch {
      // skip malformed payload
    }
  }

  return parsed;
};

const warmRedisFromMongo = async (messages) => {
  if (!redisEnabled || !redisClient || !Array.isArray(messages) || messages.length === 0) return;

  await redisClient.del(redisChatKey);
  await redisClient.del(redisChatMirrorKey);

  for (const msg of messages) {
    if (!shouldCacheMessage(msg)) continue;
    const payload = JSON.stringify(safeRedisMessage(msg));
    await redisClient.rpush(redisChatKey, payload);
    await redisClient.rpush(redisChatMirrorKey, payload);
  }

  await trimRedisListToMax(redisChatKey, redisChatMaxItems);
  await trimRedisListToMax(redisChatMirrorKey, redisChatMaxItems);
  await redisClient.expire(redisChatKey, redisChatTtlSeconds);
  await redisClient.expire(redisChatMirrorKey, redisChatTtlSeconds);
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^https?:\/\/localhost:\d+$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());
app.disable("x-powered-by");

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

if (redisEnabled) {
  console.log("Upstash Redis enabled for chat cache");
} else {
  console.log("Upstash Redis disabled (missing env)");
}

const testRedisConnection = async () => {
  if (!redisEnabled || !redisClient) return;
  try {
    const pong = await redisClient.ping();
    const keyCount = await redisClient.dbsize();
    console.log(`Upstash Redis connected: ${pong} | dbsize=${keyCount}`);

    // Deep probe to verify write/read/list operations on the exact same connection.
    const probeKey = "chat:redis_probe";
    const probeListKey = "chat:redis_probe_list";
    const probeValue = `ok-${Date.now()}`;

    await redisClient.set(probeKey, probeValue, { ex: 120 });
    const probeRead = await redisClient.get(probeKey);

    await redisClient.del(probeListKey);
    await redisClient.rpush(probeListKey, probeValue);
    const probeListLen = await redisClient.llen(probeListKey);
    const probeListSample = await redisClient.lrange(probeListKey, 0, -1);

    console.log(
      `[REDIS PROBE] get=${probeRead} llen=${probeListLen} list=${JSON.stringify(probeListSample)}`
    );
  } catch (error) {
    console.error("Upstash Redis connection failed:", error.message);
  }
};

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
    usersCache = { data: null, expiresAt: 0 };

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
    const now = Date.now();
    if (usersCache.data && now < usersCache.expiresAt) {
      return res.json(usersCache.data);
    }

    const users = await User.find().lean();
    usersCache = {
      data: users,
      expiresAt: now + userCacheTtlMs,
    };

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
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
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
  messagesCache = { data: null, expiresAt: 0 };
  if (redisEnabled && redisClient) {
    try {
      await redisClient.del(redisChatKey);
      await redisClient.del(redisChatMirrorKey);
    } catch (error) {
      console.error("Error clearing redis chat cache:", error.message);
    }
  }
  console.log(findChat)
  res.json(findChat)
})

app.post("/images", async (req, res) => {
  try {
    const { url, type = "gif", nama = "", profesi = "" } = req.body;

    if (!url) {
      return res.status(400).json({ message: "url wajib diisi" });
    }

    const savedImage = await Image.create({ url, type, nama, profesi });
    return res.status(201).json(savedImage);
  } catch (error) {
    console.error("Error saving image:", error);
    return res.status(500).json({ message: "gagal menyimpan image" });
  }
});

// GIF API Endpoints
app.get("/api/gifs/featured", async (req, res) => {
  try {
    const gifApiKey = process.env.GIF_API;
    if (!gifApiKey) {
      return res.status(500).json({ error: "GIF API key not configured" });
    }

    const response = await axios.get(
      `https://api.klipy.com/v2/featured?key=cK8X2nnSviGyH2gHSoS5rP5kMbOa4soS6gLUA2rf1aVKclB7lOzpFnASuzggwhOT`
    );

    res.json(response.data)
  } catch (error) {
    console.error("Error fetching featured GIFs:", error.message);
    res.status(500).json({ error: "Failed to fetch featured GIFs" });
  }
});

app.get("/api/gifs/search", async (req, res) => {
  try {
    const { q } = req.query;
    const gifApiKey = process.env.GIF_API;

    if (!gifApiKey) {
      return res.status(500).json({ error: "GIF API key not configured" });
    }

    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const response = await axios.get(
      `https://api.klipy.com/v2/search?q=${encodeURIComponent(q)}&key=${gifApiKey}`
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error searching GIFs:", error.message);
    res.status(500).json({ error: "Failed to search GIFs" });
  }
});

// todo : socket 
// todo : socket
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io");
const { log } = require("console");

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^https?:\/\/localhost:\d+$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Socket CORS blocked origin: ${origin}`));
    },
    credentials: true
  },
  maxHttpBufferSize: 10e6, 
  pingTimeout: 60000,
  connectTimeout: 60000
})

const onlineUsers = new Map()
const typingUsers = new Map()

//! Rate limit tracker untuk socket events
const socketRateLimits = new Map()
const messageBurstTracker = new Map()
const slowModeUntilByUser = new Map()
const SPAM_BURST_THRESHOLD = 5
const SPAM_BURST_WINDOW_MS = 8000
const SLOWMODE_MS = 10000

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

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of socketRateLimits.entries()) {
    const recentTimestamps = timestamps.filter((t) => now - t < 60000);
    if (recentTimestamps.length > 0) {
      socketRateLimits.set(key, recentTimestamps);
    } else {
      socketRateLimits.delete(key);
    }
  }

  for (const [userKey, timestamps] of messageBurstTracker.entries()) {
    const recent = timestamps.filter((t) => now - t < SPAM_BURST_WINDOW_MS);
    if (recent.length > 0) {
      messageBurstTracker.set(userKey, recent);
    } else {
      messageBurstTracker.delete(userKey);
    }
  }

  for (const [userKey, untilTs] of slowModeUntilByUser.entries()) {
    if (now >= untilTs) {
      slowModeUntilByUser.delete(userKey);
    }
  }
}, 60000);

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

 client.on("sendMessage", async (data, ack) => {
  try {
    const safeAck = typeof ack === "function" ? ack : () => {};
    const userKey = `${client.id}:${data?.nama || "unknown"}`
    const now = Date.now()
    const activeSlowModeUntil = slowModeUntilByUser.get(userKey) || 0
    if (activeSlowModeUntil > now) {
      const waitSeconds = Math.ceil((activeSlowModeUntil - now) / 1000)
      client.emit("error", {
        message: `Slowmode aktif. Tunggu ${waitSeconds} detik sebelum kirim lagi.`,
      })
      safeAck({ ok: false, reason: "slowmode", waitSeconds })
      return
    }

    const prevTimestamps = messageBurstTracker.get(userKey) || []
    const recentTimestamps = prevTimestamps.filter((ts) => now - ts < SPAM_BURST_WINDOW_MS)
    recentTimestamps.push(now)
    messageBurstTracker.set(userKey, recentTimestamps)

    if (recentTimestamps.length >= SPAM_BURST_THRESHOLD) {
      slowModeUntilByUser.set(userKey, now + SLOWMODE_MS)
      messageBurstTracker.set(userKey, [])
      client.emit("error", {
        message: "Spam terdeteksi. Slowmode 10 detik diaktifkan.",
      })
      safeAck({ ok: false, reason: "spam" })
      return
    }

    if (!checkSocketRateLimit(client.id, 'sendMessage', 10, 30000)) {
      client.emit("error", { message: "Terlalu sering mengirim pesan" })
      safeAck({ ok: false, reason: "rate_limited" })
      return
    }

    console.log("DATA DARI FE:", {
      hasImg: !!data.img,
      imgLength: data.img?.length,
      hasReplay: !!data.replayMsg,
    })

    const {
      nama,
      profesi,
      pesan,
      profileImage,
      img,
      gif,
      gifPreview,
      gifOriginal,
      replayMsg,
      replayName,
      replayImg,
    } = data

    const chatPayload = {
      nama,
      profesi,
      pesan,
      profileImage,
      img,
      gif,
      gifPreview,
      gifOriginal,
      replayMsg,
      replayName,
      replayImg
    };

    try {
      const redisWriteResult = await pushMessageToRedis({
        ...chatPayload,
        tempId: `redis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
      });
      const redisLength = await redisClient.llen(redisChatKey);
      console.log(
        `[REDIS] chat cached | key=${redisChatKey} mirror=${redisChatMirrorKey} length=${redisLength} detail=${JSON.stringify(redisWriteResult)}`
      );
    } catch (error) {
      console.error("Error pushing message to redis:", error.message);
    }

    const newChat = new Chat(chatPayload)

    const savedChat = await newChat.save()
    messagesCache = { data: null, expiresAt: 0 };

    if (typingUsers.has(client.id)) {
      typingUsers.delete(client.id)
      client.broadcast.emit("userTypingUpdate", { nama, isTyping: false })
    }

    io.emit("receiveMessage", savedChat)
    safeAck({ ok: true, id: savedChat?._id })
  } catch (error) {
    console.error("Error saving chat:", error)
    if (typeof ack === "function") {
      ack({ ok: false, reason: "server_error" })
    }
  }
})

  client.on("typing:start", (data = {}) => {
    try {
      const nama = data?.nama;
      if (!nama) return;
      if (!checkSocketRateLimit(client.id, "typingStart", 25, 10000)) return;
      typingUsers.set(client.id, nama);
      client.broadcast.emit("userTypingUpdate", { nama, isTyping: true });
    } catch (error) {
      console.error("Error typing:start:", error);
    }
  });

  client.on("typing:stop", (data = {}) => {
    try {
      const nama = data?.nama || typingUsers.get(client.id);
      if (!nama) return;
      typingUsers.delete(client.id);
      client.broadcast.emit("userTypingUpdate", { nama, isTyping: false });
    } catch (error) {
      console.error("Error typing:stop:", error);
    }
  });


  client.on("getMessages", async (payload = {}) => {
    try {
      //! Rate limit: max 20 getMessages per minute
      if (!checkSocketRateLimit(client.id, 'getMessages', 20, 60000)) {
        client.emit("error", { message: "Terlalu sering request pesan" })
        return
      }

      const requestedLimit = Number(payload.limit) || 80
      const safeLimit = Math.max(20, Math.min(requestedLimit, 200))

      if (redisEnabled) {
        try {
          const redisMessages = await getMessagesFromRedis(safeLimit);
          if (Array.isArray(redisMessages) && redisMessages.length > 0) {
            client.emit("allMessages", redisMessages.slice(-safeLimit));
            return;
          }
        } catch (error) {
          console.error("Error reading redis chat cache:", error.message);
        }
      }

      const now = Date.now()
      if (messagesCache.data && now < messagesCache.expiresAt) {
        client.emit("allMessages", messagesCache.data.slice(-safeLimit))
        return
      }

      const chats = await Chat.find()
        .sort({ timestamp: -1 })
        .limit(200)
        .lean()
      chats.reverse()
      messagesCache = {
        data: chats,
        expiresAt: now + messageCacheTtlMs,
      }

      if (redisEnabled) {
        warmRedisFromMongo(chats).catch((error) => {
          console.error("Error warming redis chat cache:", error.message);
        });
      }

      client.emit("allMessages", chats.slice(-safeLimit))
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

      const slowKeys = Array.from(slowModeUntilByUser.keys()).filter((k) =>
        k.startsWith(`${client.id}:`)
      )
      slowKeys.forEach((key) => slowModeUntilByUser.delete(key))

      const burstKeys = Array.from(messageBurstTracker.keys()).filter((k) =>
        k.startsWith(`${client.id}:`)
      )
      burstKeys.forEach((key) => messageBurstTracker.delete(key))
      const typingName = typingUsers.get(client.id)
      if (typingName) {
        typingUsers.delete(client.id)
        client.broadcast.emit("userTypingUpdate", {
          nama: typingName,
          isTyping: false,
        })
      }
      
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

server.listen(port, async () => {
  console.log(`listening on port :${port} [${nodeEnv}]`);
  await testRedisConnection();
})
