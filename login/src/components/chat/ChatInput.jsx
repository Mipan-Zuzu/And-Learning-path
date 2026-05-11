import React, { Suspense } from "react";
import {
  FiBarChart2,
  FiCamera,
  FiEdit2,
  FiImage,
  FiPlus,
  FiSend,
  FiSmile,
  FiX,
} from "react-icons/fi";

function ChatInput({
  replayPreview,
  onSubmit,
  sendFile,
  setSendFile,
  handleimgchat,
  showPicker,
  setShowPicker,
  fetchFeaturedGifs,
  gifPickerNode,
  newMessage,
  setNewMessage,
  disturb,
  onPlaySound,
  isSending,
  onMessageChange,
}) {
  return (
    <>
      <div
        className={`px-30 py-20 absolute bottom-0 mb-20 ml-3 rounded-lg ${sendFile} file-show`}
        style={{ border: "1px solid #C0C0C0", backgroundColor: "#D9D9D9" }}
      >
        <div className="absolute left-5 -mt-16 mb">
          <label className="flex gap-3 w-50 hover:bg-gray-200 p-2 rounded-sm cursor-pointer">
            <FiImage size={25} />
            <input type="file" accept="image/*" onChange={handleimgchat} className="hidden" />
            <p className="font-semibold mt-1 text-sm">Uploud picture</p>
          </label>
          <button className="flex gap-3 hover:bg-gray-200 p-2 w-50 rounded-sm cursor-pointer">
            <FiBarChart2 size={25} />
            <p className="font-semibold mt-1 text-sm">Create Poll</p>
          </button>
          <button className="flex gap-3 w-50 hover:bg-gray-200 p-2 rounded-sm cursor-pointer">
            <FiCamera size={25} />
            <p className="font-semibold mt-1 text-sm">Open Camera</p>
          </button>
        </div>
      </div>

      <div
        className="px-6 py-4"
        style={{ borderTop: "1px solid #C0C0C0", backgroundColor: "#D9D9D9" }}
      >
        {replayPreview}
        {isSending && (
          <div className="mb-2 flex items-center justify-center sm:hidden">
            <div className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
              Mengirim...
            </div>
          </div>
        )}
        <form onSubmit={onSubmit} className="flex gap-2 justify-center items-center">
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition cursor-pointer"
            onClick={() => setSendFile(sendFile === "hidden" ? "block" : "hidden")}
          >
            {sendFile === "hidden" ? <FiPlus size={25} /> : <FiX size={25} className="rotate" />}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowPicker(!showPicker);
                if (!showPicker) fetchFeaturedGifs();
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition"
              title="GIF"
            >
              <FiSmile size={24} />
            </button>
            {showPicker && <Suspense fallback={null}>{gifPickerNode}</Suspense>}
          </div>
          <input
            type="text"
            accept="image/*"
            value={newMessage}
            onChange={(e) => {
              const value = e.target.value;
              setNewMessage(value);
              onMessageChange?.(value);
            }}
            placeholder="# Message"
            autoFocus
            className="px-4 flex-1 min-w-0 py-2 border rounded-xl font-semibold text-gray-900 text-sm outline-none focus:border-gray-500 transition input-message"
          />
          <button
            type="submit"
            disabled={isSending}
            onClick={() => {
              if (disturb !== "unDisturb") onPlaySound();
            }}
            className="w-20 h-9 text-gray-600 border-none rounded-full text-xs cursor-pointer flex items-center justify-center gap-1 transition button-message disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <span className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                <span className="hidden sm:inline">Mengirim</span>
              </>
            ) : (
              <FiSend size={24} />
            )}
          </button>
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition"
          >
            <FiEdit2 size={24} />
          </button>
        </form>
      </div>
    </>
  );
}

export default ChatInput;
