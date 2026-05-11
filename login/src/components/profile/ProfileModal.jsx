import React from "react";
import { FiPlus, FiX } from "react-icons/fi";

function ProfileModal({
  show,
  editNama,
  editProfesi,
  editImage,
  setEditNama,
  setEditProfesi,
  onImageChange,
  onClose,
  onSave,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-xl">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-gray-900">
            <span className="font-bold">
              <span className="text-2xl">&</span>and
            </span>{" "}
            profile
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer opacity-60 hover:opacity-100 bg-gray-300 p-1 rounded-full"
            title="Close"
          >
            <FiX size={24} title="Close" />
          </button>
        </div>

        <div className="mb-4 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full  flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
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
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-300">
              <FiPlus size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
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
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Simpan
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg font-semibold text-gray-900 hover:bg-gray-100 transition"
            style={{ borderColor: "#C0C0C0" }}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;

