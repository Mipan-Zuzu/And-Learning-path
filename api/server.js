const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const User = require("./model/model");
const dotenv = require("dotenv")
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");

dotenv.config();

const dbUser = process.env.DB_USERNAME;
const dbPass = process.env.DB_PASSWORD;
const secretkey = process.env.AUTH_KEY;
const acctoken = process.env.ACC_TOKEN;
let token

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());


app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("home");
});

mongoose
.connect(
  `mongodb+srv://${dbUser}:${dbPass}@cluster0.kvl3gwe.mongodb.net/people`
)
.then(() => console.log("connected"));

const createUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return res
      .status(400)
      .json({ message: "Email dan Password kosong silakan isi dahulu" });
    }
    
    const newUser = new User({ Email, Password });
    const savedUser = await newUser.save();

    return res
      .status(201)
      .json({ message: "berhasil di tambahkan", user: savedUser });
    } catch (error) {
      console.error(error);
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
  const { Email, Password } = req.body;
  
  const user = await User.findOne({ Email, Password });
  if (!user) {
    return res.json({
      login: false,
      message: "Email atau password salah",
    });
  }
  
  const payload = {id : user._id}
  token = jwt.sign(payload, secretkey, {expiresIn : "5m"})
  console.log({token : token})
  if(token.length > 0) {
    return res
    .cookie(acctoken, token, {
      httpOnly : true,
      secure : process.env.NODE_ENV === "production"
    })
    .status(200)
    .json({login: true, message : "login berhasil"})
  }
  
  if (req.cookies.access_token) {
    console.log({message : "ada"})
  } else {
    console.log({message : "ga ada"})
  }
};

app.get("/logout", (req, res) => {
});


app.get("/check-session", (req, res) => {
    const data = req.cookies[process.env.VAL_ACC]
    if(!data) return res.json({login : false})

    try {
      const decode = jwt.verify(data, process.env.AUTH_KEY)
      return res.json({login : true, user : decode})
    }catch {
      return res.json({login : false})
    }
})


app.post("/result", createUser);
app.get("/api", getAllUsers);
app.post("/login", loginCheck);

app.listen(5000, () => console.log("listening on port :5000"));
