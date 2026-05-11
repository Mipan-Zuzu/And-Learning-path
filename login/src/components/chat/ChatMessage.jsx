import React from "react";

function ChatMessage({
  msg,
  nama,
  isDataSaverMode,
  loadedGifIds,
  setLoadedGifIds,
  onContextMenu,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  onTouchCancel,
}) {
  const isOwnMessage = msg.nama === nama;
  const isGifMessage =
    Boolean(msg.gif) ||
    (typeof msg.pesan === "string" && /^https?:\/\/.+\.gif(\?.*)?$/i.test(msg.pesan));
  const gifSrc = msg.gif || msg.pesan;
  const gifPreviewSrc = msg.gifPreview || gifSrc;
  const gifLoadKey = msg._id || `${msg.nama}-${msg.timestamp}`;
  const shouldLoadGif = !isDataSaverMode || loadedGifIds[gifLoadKey];

  return (
    <div className="flex justify-start">
      <div className="flex gap-2 w-fit max-w-xs md:max-w-md ml-5">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
            {msg.profileImage ? (
              <img src={msg.profileImage} alt="profile" className="w-full h-full object-cover" />
            ) : (
              msg.nama.charAt(0).toUpperCase()
            )}
          </div>
        </div>
        <div className="w-fit max-w-xs md:max-w-md">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <strong className="text-gray-900 text-sm">
              {isOwnMessage ? <span className="text-cyan-700">{msg.nama}</span> : msg.nama}
            </strong>
            <span className="text-xs text-gray-600 px-2 py-1 rounded-full">{msg.profesi}</span>
          </div>

          {msg.replayMsg && (
            <div
              className="text-gray-900 p-3 py-2 rounded-lg mb-2 text-xs border-l-4 opacity-80 flex gap-2"
              style={{
                backgroundColor: "#F5F5F5",
                borderLeftColor: "#4CAF50",
                borderColor: "#E0E0E0",
                border: "1px solid #E0E0E0",
              }}
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-700 mb-1">↳ {msg.replayName}</div>
                <div className="text-gray-600 break-words line-clamp-2">
                  {msg.replayMsg.length > 80
                    ? `${msg.replayMsg.substring(0, 80)}...`
                    : msg.replayMsg}
                </div>
              </div>
              {msg.replayImg && (
                <div className="flex-shrink-0">
                  <img
                    src={msg.replayImg}
                    alt="reply-img"
                    className="w-14 h-14 rounded object-cover"
                  />
                </div>
              )}
            </div>
          )}

          <div
            className={`text-gray-900 p-5 py-2 rounded-2xl mb-1 text-sm ${
              msg.img || msg.pesan.length <= 15 ? "border-none" : "border-2 border-gray-400"
            }`}
            style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            onContextMenu={(e) => onContextMenu(e, msg)}
            onTouchStart={(e) => onTouchStart(e, msg)}
            onTouchEnd={onTouchEnd}
            onTouchMove={onTouchMove}
            onTouchCancel={onTouchCancel}
          >
            {!isGifMessage && <span>{msg.pesan}</span>}
            {isGifMessage &&
              (shouldLoadGif ? (
                <img
                  src={gifSrc}
                  alt="chat-gif"
                  className="max-w-[200px] mt-2 rounded-md"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setLoadedGifIds((prev) => ({ ...prev, [gifLoadKey]: true }))}
                  className="relative mt-2 rounded-md overflow-hidden border border-gray-300"
                >
                  <img
                    src={gifPreviewSrc}
                    alt="gif-preview"
                    className="max-w-[200px] max-h-[160px] object-cover opacity-90"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white bg-black/35">
                    Tap untuk putar GIF
                  </span>
                </button>
              ))}
            {msg.img && (
              <img
                src={msg.img}
                alt="chat-img"
                className="max-w-[200px] mt-2"
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
          <div className="text-end ml-5 mt-3 flex gap-3">
            <div className="text-xs text-gray-500 px-1">
              {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;

