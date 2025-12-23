import React, { useEffect, useState } from "react";
import EmojiPicker from 'emoji-picker-react';
import { io } from "socket.io-client";
import {
  FiUser,
  FiMessageCircle,
  FiSettings,
  FiBell,
  FiBellOff,
  FiSend,
  FiUsers,
  FiPlus,
  FiEdit2,
  FiX,
  FiTrash,
} from "react-icons/fi";
import { RiPushpinLine } from "react-icons/ri";
import { MdBlock, MdOutlineEmojiEmotions,MdDraw  } from "react-icons/md";
import { IoSend,IoArrowRedoSharp  } from "react-icons/io5";
import { LuSticker } from "react-icons/lu";
import axios from "axios"
import { BsPinAngleFill } from "react-icons/bs";
import { IoMdSettings } from "react-icons/io";

// Get API URL from environment or default to production
const API_URL = "https://and-api-ten.vercel.app";

function Dhasboard() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [nama, setNama] = useState("");
  const [profesi, setProfesi] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [editProfesi, setEditProfesi] = useState("");
  const [editImage, setEditImage] = useState("");
  const [disturb, setdisturb] = useState(false)
  const [pin, setpin] = useState("")
  
  const sound = new Audio('../../public/sound/buble.mp3')
  
  const toggleDisturb = () => {
    setdisturb((prev) => !prev);
  }
  
  const [showPicker, setShowPicker] = useState(false)
  
  useEffect(() => {
    
    const storedNama = localStorage.getItem("nama") || "User";
    const storedProfesi = localStorage.getItem("profesi") || "Unknown";
    const storedImage = localStorage.getItem("profileImage") || "";
    
    
    setNama(storedNama);
    setProfesi(storedProfesi);
    setProfileImage(storedImage);
    setEditNama(storedNama);
    setEditProfesi(storedProfesi);
    setEditImage(storedImage);
    
    // Connect ke server
    const newSocket = io(API_URL);
    setSocket(newSocket);
    
    // User masuk
       newSocket.emit("userOnline", {
      nama: storedNama,
      profesi: storedProfesi,
      profileImage: storedImage,
    });
    newSocket.emit("getMessages");
    newSocket.emit("getOnlineUsers");
    
    // Listen events
    newSocket.on("allMessages", (data) => {
      setMessages(data);
    });

    newSocket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    
    newSocket.on("onlineUsersList", (users) => {
      setOnlineUsers(users);
    });
    
    newSocket.on("userStatusUpdate", (data) => {
      const { type, user } = data;
      if (type === "online") {
        setOnlineUsers((prev) => {
          const exists = prev.some((u) => u.nama === user.nama);
          return exists ? prev : [...prev, user];
        });
      } else if (type === "offline") {
        setOnlineUsers((prev) => prev.filter((u) => u.nama !== user.nama));
      }
    });
  
  
  return () => {
    newSocket.disconnect();
  };
  }, []);
  

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setNama(editNama);
    setProfesi(editProfesi);
    setProfileImage(editImage);
    
    localStorage.setItem("nama", editNama);
    localStorage.setItem("profesi", editProfesi);
    localStorage.setItem("profileImage", editImage);
    
    if (socket) {
      socket.emit("userOnline", {
        nama: editNama,
        profesi: editProfesi,
        profileImage: editImage,
      });
    }

    setShowProfileModal(false);
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    if (socket) {
      socket.emit("sendMessage", {
        nama,
        profesi,
        pesan: newMessage,
        profileImage,
      });
    }

    setNewMessage("");
  };
  
  const deleteMessagesss = async (index) => {
  try {
    await axios.delete(`${API_URL}/chatDirect/${index}`);
    setMessages(prev => prev.filter(msg => msg._id !== index));
  } catch (error) {
    console.error('Delete failed:', error);
  }
};

  return (
    <div
      className="crt-bg h-screen flex"
      style={{ backgroundColor: "#D9D9D9" }}
    >
      <div
        className="w-20 flex flex-col items-center pt-5 pb-5"
        style={{ backgroundColor: "#E5E5E5", borderRight: "1px solid #C0C0C0" }}
        >
          <img src="./../../public/img/icon.png" alt="logo&" width={50} />
        <div className="mb-8 cursor-pointer opacity-60 hover:opacity-100 transition">
        </div>
        <div className="flex-1 flex flex-col gap-5">
          <div className="cursor-pointer opacity-60 hover:opacity-100 transition">
            <FiUser size={24} />
          </div>
          <div className="cursor-pointer opacity-60 hover:opacity-100 transition">
            <FiMessageCircle size={24} />
          </div>
          <div className="cursor-pointer opacity-60 hover:opacity-100 transition title='Add Group'">
            <FiPlus size={24} />
          </div>
        </div>
        <div
          className="mb-5 cursor-pointer opacity-60 hover:opacity-100 transition hover:rotate-180"
          onClick={() => setShowProfileModal(true)}
          title="Edit Profile"
        >
          <IoMdSettings size={24} />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div
          className="px-6 py-4 flex justify-between items-center"
          style={{
            backgroundColor: "#D9D9D9",
            borderBottom: "1px solid #C0C0C0",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden border-green-600 border-3">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                nama.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">{nama}</div>
              <div className="text-xs text-gray-600">{profesi}</div>
            </div>
          </div>
          <div className="flex gap-5">
            <div className="cursor-pointer opacity-70 hover:opacity-100">
              <button onClick={toggleDisturb} aria-label="toggle-do-not-disturb">
                {disturb ? <FiBellOff size={20} title="Un Disturb" /> : <FiBell size={20} title="Disturb"/>}
              </button>
            </div>
          </div>
        </div>
        <h1 className={`mt-3 text-center flex justify-center gap-3 font-mono cursor-pointer ${pin.length === 0 ? "hidden" : "block"}`}><BsPinAngleFill size={17}/>{pin.substring(0,30)}...</h1>
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
        <h1 className="text-center text-gray-400 font-mono opacity-25">#Senang belajar dengan <span className="text-black">&And</span></h1>
          {messages.length === 0 ? (
            <p className="text-center text-gray-400 mt-10 loading">loading message 99%</p>
          ) : (
            messages.map((msg, index) => {
              const isOwnMessage = msg.nama === nama;
              return (
                <div
                  key={index}
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="flex gap-2 w-fit max-w-xs md:max-w-md">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br  border-black flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                          {msg.profileImage ? (
                            <img
                              src={msg.profileImage}
                              alt="profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            msg.nama.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>
                      <div className="w-fit max-w-xs md:max-w-md">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <strong className="text-gray-900 text-sm">
                            {msg.nama}
                          </strong>
                          <span className="text-xs  text-gray-600 px-2 py-1 rounded-full">
                            {msg.profesi}
                          </span>
                        </div>
                        <div
                          className={`text-gray-900 p-5 py-2 rounded-2xl mb-1 text-sm ${msg.pesan.length <= 5 ? "border-none" : "border-2 border-gray-400"}`}
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          <span>{msg.pesan}</span>
                        </div>
                        <div className="text-end ml-5 mt-3 flex gap-3">
                          <div className="text-xs text-gray-500 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString(
                              "id-ID",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </div>
                          <div className="ml-10 flex gap-3">
                            <button title="Delete" onClick={() =>  {
                              deleteMessagesss(msg._id)
                              
                              }}>
                              <FiTrash size={15} />
                            </button>
                            <button title="Pin" onClick={() => setpin(msg.pesan)}>
                              <RiPushpinLine size={15} />
                            </button>
                            <MdBlock title="Block" size={15} />
                            <IoArrowRedoSharp title="Replay" size={15} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {isOwnMessage && (
                    <div className="flex gap-2 w-fit max-w-xs md:max-w-md flex-row-reverse justify-end">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt="profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            nama.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>
                      <div className="w-fit max-w-xs md:max-w-md text-right">
                        <div className="flex items-center justify-end gap-2 mb-1 flex-wrap">
                          <span className="text-xs py-1 rounded-full">
                            {profesi}
                          </span>
                          <strong className="text-gray-900 text-sm">
                            {nama}
                          </strong>
                        </div>
                        <div
                          className={`text-black p-5 py-2 rounded-2xl mb-1 text-sm ${msg.pesan.length <= 5 ? "border-none" : "border-2 border-gray-600"}`}
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {msg.pesan}
                        </div>
                        <div className="flex ml-20 mt-3">
                            <div className="flex gap-3">
                            <button title="Delete" onClick={() =>  {
                              deleteMessagesss(msg._id)
                              
                              }}>
                              <FiTrash size={15} />
                            </button>
                            <button onClick={() => setpin(msg.pesan)}>
                              <RiPushpinLine title="Pin" size={15} />
                            </button>
                          </div>
                        <div className="text-xs text-gray-500 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div
          className="px-6 py-4"
          style={{ borderTop: "1px solid #C0C0C0", backgroundColor: "#D9D9D9" }}
        >
          <form onSubmit={handleSendMessage} className="flex gap-2 justify-center">
            <button
              type="button"
              className="w-9 h-9 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition"
              onClick={() => <CardImg />}
            >
              <FiPlus size={26} />
            </button>
            <div className="relative"> 
                <button 
                  type="button" 
                  onClick={() => setShowPicker(!showPicker)}
                  className="w-9 h-9 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition" 
                > 
                  <MdOutlineEmojiEmotions size={26} /> 
                </button> 
                {showPicker && ( 
                  <div className="absolute bottom-10 left-0 z-50">
                    <EmojiPicker 
                      onEmojiClick={(emojiObject) => {
                        setNewMessage((prev) => prev + emojiObject.emoji);
                        setShowPicker(false);
                      }} 
                    /> 
                  </div>
                )} 
            </div>
            <button
              type="button"
              className="w-9 h-9 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition"
            >
             <LuSticker  size={26}/>
            </button>
            <input
              type="text"
              accept="image/*"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="# Send Message"
              className="w-lg px-4 py-2 border rounded-full font-semibold text-gray-900 text-sm outline-none focus:border-gray-500 transition"
            />
            <button
              type="submit"
              onClick={() => sound.play()}
              className="w-9 h-9 text-gray-600 border-none rounded-full text-lg cursor-pointer flex items-center justify-center transition"
            >
              <IoSend size={26} />
            </button>
            <button
              type="button"
              className="w-9 ml-10 h-9 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition"
            >
              <MdDraw size={26} />
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar - User Status */}
      <div
        className="w-56 px-5 py-5 overflow-y-auto"
        style={{ backgroundColor: "#D9D9D9", borderLeft: "1px solid #C0C0C0" }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center mb-4">
            <div
              className="text-gray-900  px-3 py-2 rounded-lg originPixels cursor-pointer w-full text-center transition flex items-center justify-center gap-1"
              style={{ backgroundColor: "#EEEEEE" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#E0E0E0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#EEEEEE")}
            >
              <FiPlus size={16} /> Tambah teman
            </div>
          </div>

          <div className="text-xs text-gray-600  font-bold mt-4 mb-3 uppercase">
            Online ({onlineUsers.length})
          </div>
          {onlineUsers.length === 0 ? (
            <p className="text-xs text-gray-400">Tidak ada user online</p>
          ) : (
            onlineUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-gray-900 text-sm transition"
                style={{}}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#EEEEEE")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.nama.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: "#4CAF50" }}
                  ></div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{user.nama}</div>
                  <div className="text-xs text-gray-500">{user.profesi}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-xl">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-gray-900"><span className="font-bold">&and</span> profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="cursor-pointer opacity-60 hover:opacity-100"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                  {editImage ? (
                    <img
                      src={editImage}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    editNama.charAt(0).toUpperCase()
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-gray-400 text-white p-2 rounded-full cursor-pointer hover:bg-gray-300">
                  <FiPlus size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Username
              </label>
              <input
                type="text"
                value={editNama}
                onChange={(e) => setEditNama(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                style={{ borderColor: "#C0C0C0" }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Profesi
              </label>
              <input
                type="text"
                value={editProfesi}
                onChange={(e) => setEditProfesi(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"
                style={{ borderColor: "#C0C0C0" }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Simpan
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg font-semibold text-gray-900 hover:bg-gray-100 transition"
                style={{ borderColor: "#C0C0C0" }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CardImg = () => {
  console.log("img")
  return (
    <div className="z-50 bg-white p-20">
      <h1>Pilih gambar vidio atau gif</h1>
    </div>
  )
}

export default Dhasboard;
