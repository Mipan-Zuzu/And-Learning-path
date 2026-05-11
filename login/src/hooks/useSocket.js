import { useEffect, useRef, useState } from "react";
import { createSocket } from "../services/socket";

export function useSocket({ apiUrl, nama, profesi, profileImage, messageLimit = 80 }) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    const newSocket = createSocket(apiUrl);
    socketRef.current = newSocket;
    setSocket(newSocket);

    const emitInitialData = () => {
      newSocket.emit("getMessages", { limit: messageLimit });
      newSocket.emit("getOnlineUsers");
      if (nama) {
        newSocket.emit("userOnline", { nama, profesi, profileImage });
      }
    };

    newSocket.on("connect", () => {
      console.log("[SOCKET] connected:", newSocket.id);
      emitInitialData();
    });

    newSocket.on("connect_error", (error) => {
      console.error("[SOCKET] connect_error:", error.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("[SOCKET] disconnected:", reason);
    });

    newSocket.on("allMessages", (data) => {
      setMessages(data);
    });

    newSocket.on("receiveMessage", (data) => {
      setMessages((prev) => {
        const next = [...prev, data];
        if (next.length > 120) return next.slice(-120);
        return next;
      });
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
        setTypingUsers((prev) => prev.filter((typingName) => typingName !== user.nama));
      }
    });

    newSocket.on("userTypingUpdate", ({ nama: typingName, isTyping }) => {
      if (!typingName) return;
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(typingName) ? prev : [...prev, typingName];
        }
        return prev.filter((name) => name !== typingName);
      });
    });

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, [apiUrl, messageLimit, nama, profesi, profileImage]);

  const emitUserOnline = (user) => {
    socketRef.current?.emit("userOnline", user);
  };

  const emitTypingStart = (typingName) => {
    if (!typingName) return;
    socketRef.current?.emit("typing:start", { nama: typingName });
  };

  const emitTypingStop = (typingName) => {
    if (!typingName) return;
    socketRef.current?.emit("typing:stop", { nama: typingName });
  };

  return {
    socket,
    messages,
    setMessages,
    onlineUsers,
    typingUsers,
    emitUserOnline,
    emitTypingStart,
    emitTypingStop,
  };
}
