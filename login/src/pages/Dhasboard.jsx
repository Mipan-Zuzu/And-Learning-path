import "../index.css";
import React, { lazy, useEffect, useRef, useState } from "react";
import {
  FiBell,
  FiBellOff,
  FiMapPin,
  FiMenu,
  FiMessageCircle,
  FiPlus,
  FiSettings,
  FiSidebar,
  FiUser,
} from "react-icons/fi";
import axios from "axios";
import { useSocket } from "../hooks/useSocket";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";
import ReplyPreview from "../components/chat/ReplyPreview";
import ProfileModal from "../components/profile/ProfileModal";
import ContextMenu from "../components/chat/ContextMenu";

const GifPicker = lazy(() => import("../components/GifPicker"));
const API_URL = "http://localhost:5000";

function Dhasboard() {
  const [newMessage, setNewMessage] = useState("");
  const [nama, setNama] = useState("");
  const [profesi, setProfesi] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [editProfesi, setEditProfesi] = useState("");
  const [editImage, setEditImage] = useState("");
  const [disturb, setdisturb] = useState("unDisturb");
  const [pin, setpin] = useState("");

  const soundRef = useRef(null);

  const [replayMsg, setReplayMsg] = useState("");
  const [replayName, setReplayName] = useState("");
  const [replayImg, setReplayImg] = useState("");

  const [showPicker, setShowPicker] = useState(false);
  const [gifs, setGifs] = useState([]);
  const [gifSearchInput, setGifSearchInput] = useState("");
  const [loadingGifs, setLoadingGifs] = useState(false);
  const gifSearchTimeoutRef = useRef(null);
  const [isDataSaverMode, setIsDataSaverMode] = useState(true);
  const [loadedGifIds, setLoadedGifIds] = useState({});
  const featuredGifsCacheRef = useRef(null);
  const gifSearchCacheRef = useRef(new Map());
  const activeGifRequestRef = useRef(null);

  const [rightside, setRightside] = useState("hidden");
  const [leftside, setLeftside] = useState("hidden");
  const [sendFile, setSendFile] = useState("hidden");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, msg: null });
  const longPressTimeoutRef = useRef(null);
  const typingStopTimeoutRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const [isTypingSelf, setIsTypingSelf] = useState(false);

  const { socket, messages, setMessages, onlineUsers, typingUsers, emitUserOnline, emitTypingStart, emitTypingStop } = useSocket({
    apiUrl: API_URL,
    nama,
    profesi,
    profileImage,
    messageLimit: 80,
  });

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

    return () => {
      if (gifSearchTimeoutRef.current) clearTimeout(gifSearchTimeoutRef.current);
      if (activeGifRequestRef.current) activeGifRequestRef.current.abort();
      if (typingStopTimeoutRef.current) clearTimeout(typingStopTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    soundRef.current = new Audio("/sound/buble.mp3");
  }, []);

  useEffect(() => {
    const saveData = navigator?.connection?.saveData;
    const effectiveType = navigator?.connection?.effectiveType || "";
    if (saveData || /2g|3g/.test(effectiveType)) setIsDataSaverMode(true);
  }, []);

  useEffect(() => {
    const closeContextMenu = () => setContextMenu((prev) => ({ ...prev, visible: false }));
    window.addEventListener("click", closeContextMenu);
    window.addEventListener("scroll", closeContextMenu, true);
    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("scroll", closeContextMenu, true);
    };
  }, []);

  const compressImage = (file, quality = 0.3, maxWidth = 500) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
      };
    });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEditImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleimgchat = async (e) => {
    if (!socket) return;
    const file = e.target.files[0];
    if (!file) return;
    const compressedImg = await compressImage(file, 0.3, 500);
    socket.emit("sendMessage", {
      nama,
      profesi,
      pesan: `Picture ${nama}`,
      profileImage,
      img: compressedImg,
    });
  };

  const handleSaveProfile = () => {
    const normalizeProfileImage = (rawImage, username) => {
      if (!rawImage) return "";
      if (rawImage.startsWith("data:")) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "User")}&background=0D8ABC&color=fff`;
      }
      return rawImage;
    };

    const lightweightProfileImage = normalizeProfileImage(editImage, editNama);
    setNama(editNama);
    setProfesi(editProfesi);
    setProfileImage(lightweightProfileImage);

    localStorage.setItem("nama", editNama);
    localStorage.setItem("profesi", editProfesi);
    localStorage.setItem("profileImage", lightweightProfileImage);

    emitUserOnline({ nama: editNama, profesi: editProfesi, profileImage: lightweightProfileImage });
    setShowProfileModal(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!socket || newMessage.trim() === "" || isSending) return;

    setIsSending(true);
    if (isTypingSelf) {
      emitTypingStop(nama);
      setIsTypingSelf(false);
    }
    if (typingStopTimeoutRef.current) clearTimeout(typingStopTimeoutRef.current);

    const payload = {
      nama,
      profesi,
      pesan: newMessage,
      profileImage,
      replayMsg,
      replayName,
      replayImg,
    };

    const clearInputState = () => {
      setNewMessage("");
      setReplayMsg("");
      setReplayName("");
      setReplayImg("");
    };

    let hasSettled = false;
    const done = () => {
      if (hasSettled) return;
      hasSettled = true;
      setIsSending(false);
    };

    const fallbackTimer = setTimeout(done, 6000);
    socket.emit("sendMessage", payload, (ack) => {
      clearTimeout(fallbackTimer);
      if (ack?.ok) clearInputState();
      done();
    });
  };

  const handleMessageTyping = (value) => {
    if (!nama) return;
    const hasText = value.trim().length > 0;
    if (hasText && !isTypingSelf) {
      emitTypingStart(nama);
      setIsTypingSelf(true);
    }
    if (typingStopTimeoutRef.current) clearTimeout(typingStopTimeoutRef.current);
    typingStopTimeoutRef.current = setTimeout(() => {
      emitTypingStop(nama);
      setIsTypingSelf(false);
    }, 1200);
    if (!hasText) {
      emitTypingStop(nama);
      setIsTypingSelf(false);
    }
  };

  const deleteMessagesss = async (id) => {
    try {
      await axios.delete(`${API_URL}/chatDirect/${id}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const replayFunc = (messageText, fromName, img = "") => {
    setReplayName(fromName);
    setReplayMsg(messageText);
    setReplayImg(img);
  };

  const fetchFeaturedGifs = async () => {
    if (featuredGifsCacheRef.current) return setGifs(featuredGifsCacheRef.current);
    setLoadingGifs(true);
    try {
      if (activeGifRequestRef.current) activeGifRequestRef.current.abort();
      const controller = new AbortController();
      activeGifRequestRef.current = controller;
      const response = await axios.get(`${API_URL}/api/gifs/featured`, { signal: controller.signal });
      const results = (response.data.results || []).slice(0, 8);
      featuredGifsCacheRef.current = results;
      setGifs(results);
    } catch (error) {
      if (error.name !== "CanceledError" && error.code !== "ERR_CANCELED") {
        console.error("Error fetching GIFs:", error);
        setGifs([]);
      }
    } finally {
      setLoadingGifs(false);
    }
  };

  const searchGifs = async (query) => {
    if (!query.trim()) return fetchFeaturedGifs();
    const normalizedQuery = query.trim().toLowerCase();
    if (gifSearchCacheRef.current.has(normalizedQuery)) {
      return setGifs(gifSearchCacheRef.current.get(normalizedQuery));
    }
    setLoadingGifs(true);
    try {
      if (activeGifRequestRef.current) activeGifRequestRef.current.abort();
      const controller = new AbortController();
      activeGifRequestRef.current = controller;
      const response = await axios.get(`${API_URL}/api/gifs/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      const results = (response.data.results || []).slice(0, 8);
      gifSearchCacheRef.current.set(normalizedQuery, results);
      setGifs(results);
    } catch (error) {
      if (error.name !== "CanceledError" && error.code !== "ERR_CANCELED") {
        console.error("Error searching GIFs:", error);
        setGifs([]);
      }
    } finally {
      setLoadingGifs(false);
    }
  };

  const handleGifSearch = (e) => {
    const nextValue = e.target.value;
    setGifSearchInput(nextValue);
    if (gifSearchTimeoutRef.current) clearTimeout(gifSearchTimeoutRef.current);
    gifSearchTimeoutRef.current = setTimeout(() => searchGifs(nextValue), 350);
  };

  const pickFirstString = (...values) => values.find((v) => typeof v === "string" && v.trim()) || "";

  const resolveGifUrls = (gifItem) => {
    const webpUrl = pickFirstString(
      gifItem?.webp,
      gifItem?.tinywebp,
      gifItem?.tinywebp?.url,
      gifItem?.images?.fixed_width?.webp,
      gifItem?.images?.downsized?.webp,
      gifItem?.images?.original?.webp
    );
    const originalUrl = pickFirstString(gifItem?.url, gifItem?.gif, gifItem?.original, gifItem?.images?.original?.url);
    const compressedUrl = pickFirstString(
      webpUrl,
      gifItem?.tinygif,
      gifItem?.tinygif?.url,
      gifItem?.images?.fixed_width_small?.url,
      gifItem?.images?.downsized_small?.url,
      gifItem?.nanogif,
      gifItem?.nanogif?.url,
      gifItem?.preview,
      gifItem?.preview?.url,
      originalUrl
    );
    return { compressedUrl, originalUrl: originalUrl || compressedUrl };
  };

  const resolveGifPreview = (gifItem) =>
    pickFirstString(
      gifItem?.nanogif?.preview,
      gifItem?.tinygifpreview,
      gifItem?.tinygif?.preview,
      gifItem?.preview,
      gifItem?.images?.fixed_width_still?.url,
      gifItem?.images?.preview_gif?.url,
      gifItem?.url
    );

  const insertGifToMessage = async (gifItem) => {
    if (!socket) return;
    const { compressedUrl, originalUrl } = resolveGifUrls(gifItem);
    const previewUrl = resolveGifPreview(gifItem);
    if (!compressedUrl) return;
    try {
      await axios.post(`${API_URL}/images`, { url: compressedUrl, type: "gif", nama, profesi });
    } catch (error) {
      console.error("Error saving gif to images:", error);
    }
    socket.emit("sendMessage", {
      nama,
      profesi,
      pesan: "[GIF]",
      profileImage,
      gif: compressedUrl,
      gifPreview: previewUrl,
      gifOriginal: originalUrl,
      replayMsg,
      replayName,
      replayImg,
    });
    setReplayMsg("");
    setReplayName("");
    setReplayImg("");
    setShowPicker(false);
  };

  const openContextMenu = (x, y, msg) => {
    const menuWidth = 170;
    const menuHeight = 140;
    const safeX = Math.min(x, window.innerWidth - menuWidth - 12);
    const safeY = Math.min(y, window.innerHeight - menuHeight - 12);
    setContextMenu({ visible: true, x: Math.max(12, safeX), y: Math.max(12, safeY), msg });
  };

  const handleMessageContextMenu = (e, msg) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, msg);
  };

  const handleTouchStart = (e, msg) => {
    const touch = e.touches?.[0];
    if (!touch) return;
    longPressTimeoutRef.current = setTimeout(() => openContextMenu(touch.clientX, touch.clientY, msg), 500);
  };

  const clearLongPress = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const runContextAction = (action) => {
    const msg = contextMenu.msg;
    if (!msg) return;
    if (action === "delete") deleteMessagesss(msg._id);
    if (action === "pin") setpin(msg.pesan);
    if (action === "reply") replayFunc(msg.pesan, msg.nama, msg.img || msg.gif);
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="crt-bg h-screen flex overflow-hidden" style={{ backgroundColor: "#D9D9D9" }}>
      <div
        className={`flex flex-col items-center pt-5 pb-5 w-20 absolute h-full z-50 ${leftside} ${
          leftside === "block" ? "aniamtion" : ""
        } shadow-2xl`}
        style={{ backgroundColor: "#E5E5E5", borderRight: "1px solid #C0C0C0" }}
      >
        <button onClick={() => setLeftside(leftside === "block" ? "hidden" : "block")} className="cursor-pointer">
          <img src="/img/icon.png" alt="logo" width={40} />
        </button>
        <div className="mb-8 cursor-pointer opacity-60 hover:opacity-100 transition"></div>
        <div className="flex-1 flex flex-col gap-8">
          <div className="cursor-pointer opacity-60 hover:opacity-100 transition"><FiUser size={24} /></div>
          <div className="cursor-pointer opacity-60 hover:opacity-100 transition"><FiMessageCircle size={24} /></div>
          <div className="cursor-pointer opacity-60 hover:opacity-100 transition title='Add Group'"><FiPlus size={24} /></div>
        </div>
        <div
          className="mb-5 cursor-pointer opacity-60 hover:opacity-100 transition hover:rotate-180"
          onClick={() => setShowProfileModal(true)}
          title="Edit Profile"
        >
          <FiSettings size={24} />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: "#D9D9D9", borderBottom: "1px solid #C0C0C0" }}>
          <div className="flex items-center gap-3">
            <button className="cursor-pointer" onClick={() => setLeftside(leftside === "hidden" ? "block" : "hidden")}>
              <FiMenu size={20} color="gray" />
            </button>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden border-green-600 border-3">
              {profileImage ? (
                <img src={profileImage} alt="profile" className="w-full h-full object-cover" />
              ) : (
                nama.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">{nama}</div>
              <div className="text-xs text-gray-600">{profesi}</div>
            </div>
          </div>
          <div
            className={`absolute px-10 py-2 bg-gray-700 text-gray-200 font-mono rounded-2xl z-20 backdrop:blur-2xl left-[40%] ${
              disturb === "unDisturb" ? "bell-disturb" : "show-up"
            } nontification`}
          >
            <div className="flex">
              <p className="mt-3 -ml-5 mr-5">{disturb === "unDisturb" ? <FiBellOff size={20} /> : <FiBell size={20} />}</p>
              <div>
                <p className="text-[10px]">Mode disturb</p>
                <p>{disturb === "unDisturb" ? "Actived" : "De Actived"}</p>
              </div>
            </div>
          </div>
          <div className="flex ml-3">
            <div className="opacity-70 hover:opacity-100 flex">
              <button onClick={() => setdisturb(disturb === "unDisturb" ? "disturb" : "unDisturb")} className="cursor-pointer">
                {disturb === "unDisturb" ? <FiBellOff size={20} title="Un Disturb" /> : <FiBell size={20} title="Disturb" />}
              </button>
              <button className={`ml-10 cursor-pointer ${rightside === "block" ? "hidden" : "block"}`} onClick={() => setRightside(rightside === "hidden" ? "block" : "hidden")}>
                <FiSidebar size={20} />
              </button>
            </div>
          </div>
        </div>

        <h1 className={`mt-3 text-center flex justify-center gap-3 font-mono cursor-pointer ${pin.length === 0 ? "hidden" : "block"}`}>
          <FiMapPin size={17} />
          {pin.substring(0, 30)}...
        </h1>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
          <h1 className="text-center text-gray-400 font-mono opacity-25">#Senang belajar dengan <span className="text-black">&And</span></h1>
          {messages.length === 0 ? (
            <p className="text-center text-gray-400 mt-10 loading">fetching message 98%</p>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg._id || `${msg.nama}-${msg.timestamp}`}
                msg={msg}
                nama={nama}
                isDataSaverMode={isDataSaverMode}
                loadedGifIds={loadedGifIds}
                setLoadedGifIds={setLoadedGifIds}
                onContextMenu={handleMessageContextMenu}
                onTouchStart={handleTouchStart}
                onTouchEnd={clearLongPress}
                onTouchMove={clearLongPress}
                onTouchCancel={clearLongPress}
              />
            ))
          )}
        </div>

        <ChatInput
          replayPreview={<ReplyPreview replayMsg={replayMsg} replayName={replayName} replayImg={replayImg} onClear={() => { setReplayMsg(""); setReplayName(""); setReplayImg(""); }} />}
          onSubmit={handleSendMessage}
          sendFile={sendFile}
          setSendFile={setSendFile}
          handleimgchat={handleimgchat}
          showPicker={showPicker}
          setShowPicker={setShowPicker}
          fetchFeaturedGifs={fetchFeaturedGifs}
          gifPickerNode={
            <GifPicker
              showPicker={showPicker}
              setShowPicker={setShowPicker}
              gifSearchInput={gifSearchInput}
              handleGifSearch={handleGifSearch}
              fetchFeaturedGifs={fetchFeaturedGifs}
              isDataSaverMode={isDataSaverMode}
              setIsDataSaverMode={setIsDataSaverMode}
              loadingGifs={loadingGifs}
              gifs={gifs}
              insertGifToMessage={insertGifToMessage}
              resolveGifPreview={resolveGifPreview}
              setGifSearchInput={setGifSearchInput}
            />
          }
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          disturb={disturb}
          onPlaySound={() => soundRef.current?.play()}
          isSending={isSending}
          onMessageChange={handleMessageTyping}
        />
      </div>

      <div className={`w-56 px-5 py-5 overflow-y-auto absolute justify-end right-0 h-full ${rightside}`} style={{ backgroundColor: "#D9D9D9", borderLeft: "1px solid #C0C0C0" }}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center mb-4">
            <div className="text-gray-900  px-3 py-2 rounded-lg originPixels cursor-pointer w-full text-center transition flex items-center justify-center gap-1" style={{ backgroundColor: "#EEEEEE" }}>
              <FiPlus size={16} /> Tambah teman
            </div>
            <button className="cursor-pointer ml-3" onClick={() => setRightside(rightside === "hidden" ? "block" : "hidden")}>
              <FiSidebar size={20} />
            </button>
          </div>
          <div className="text-xs text-gray-600  font-bold mt-4 mb-3 uppercase">Online ({onlineUsers.length})</div>
          {onlineUsers.length === 0 ? (
            <p className="text-xs text-gray-400">Tidak ada user online</p>
          ) : (
            onlineUsers.map((user, index) => (
              <div key={index} className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-gray-900 text-sm transition">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      user.nama.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#4CAF50" }}></div>
                </div>
                  <div className="flex-1">
                  <div className="font-semibold text-sm">{user.nama}</div>
                  {typingUsers.includes(user.nama) && user.nama !== nama ? (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <span>typing</span>
                      <span className="typing-dots">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">{user.profesi}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ProfileModal
        show={showProfileModal}
        editNama={editNama}
        editProfesi={editProfesi}
        editImage={editImage}
        setEditNama={setEditNama}
        setEditProfesi={setEditProfesi}
        onImageChange={handleProfileImageChange}
        onClose={() => setShowProfileModal(false)}
        onSave={handleSaveProfile}
      />

      <ContextMenu contextMenu={contextMenu} onAction={runContextAction} />
      <style>{`
        .context-menu-float {
          animation: context-menu-up 0.18s ease-out;
          transform-origin: top left;
        }
        @keyframes context-menu-up {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .typing-dots span {
          display: inline-block;
          animation: typing-bounce 1.1s infinite ease-in-out;
        }
        .typing-dots span:nth-child(2) {
          animation-delay: 0.15s;
        }
        .typing-dots span:nth-child(3) {
          animation-delay: 0.3s;
        }
        @keyframes typing-bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.45;
          }
          40% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default Dhasboard;
