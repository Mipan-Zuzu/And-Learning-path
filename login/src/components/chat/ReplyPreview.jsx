import React from "react";
import { FiX } from "react-icons/fi";

function ReplyPreview({ replayMsg, replayName, replayImg, onClear }) {
  if (!replayMsg) return null;

  return (
    <div
      className="mb-3 p-3 rounded-lg border-l-4 flex items-start gap-3 relative"
      style={{
        backgroundColor: "#F5F5F5",
        borderLeftColor: "#4CAF50",
        borderColor: "#E0E0E0",
        border: "1px solid #E0E0E0",
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-gray-600 mb-1">
          ↳ Replay to <span className="text-cyan-700">{replayName}</span>
        </div>
        <div className="text-sm text-gray-800 break-words">
          {replayMsg.length > 80 ? `${replayMsg.substring(0, 80)}...` : replayMsg}
        </div>
      </div>
      {replayImg && (
        <div className="flex-shrink-0">
          <img
            src={replayImg}
            alt="reply-preview"
            className="w-12 h-12 rounded object-cover"
          />
        </div>
      )}
      <button
        type="button"
        onClick={onClear}
        className="flex-shrink-0 text-gray-500 hover:text-gray-700 hover:bg-gray-300 p-1 rounded transition"
      >
        <FiX size={20} />
      </button>
    </div>
  );
}

export default ReplyPreview;

