import React from "react";
import { FiCornerUpLeft, FiMapPin, FiTrash } from "react-icons/fi";

function ContextMenu({ contextMenu, onAction }) {
  if (!contextMenu.visible) return null;

  return (
    <div
      className="fixed z-[100] w-40 rounded-xl border border-gray-300 bg-white shadow-2xl p-2 context-menu-float"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => onAction("reply")}
        className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-lg hover:bg-gray-100 text-left"
      >
        <FiCornerUpLeft size={15} /> Reply
      </button>
      <button
        onClick={() => onAction("pin")}
        className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-lg hover:bg-gray-100 text-left"
      >
        <FiMapPin size={15} /> Pin
      </button>
      <button
        onClick={() => onAction("delete")}
        className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-lg hover:bg-red-50 text-red-600 text-left"
      >
        <FiTrash size={15} /> Delete
      </button>
    </div>
  );
}

export default ContextMenu;

