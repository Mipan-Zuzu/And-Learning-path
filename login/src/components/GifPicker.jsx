import React from "react";
import { FiSearch, FiX } from "react-icons/fi";

function GifPicker({
  showPicker,
  setShowPicker,
  gifSearchInput,
  handleGifSearch,
  fetchFeaturedGifs,
  isDataSaverMode,
  setIsDataSaverMode,
  loadingGifs,
  gifs,
  insertGifToMessage,
  resolveGifPreview,
  setGifSearchInput,
}) {
  if (!showPicker) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-opacity-30 z-40"
        onClick={() => setShowPicker(false)}
      ></div>
      <div
        className="fixed md:absolute z-50 bg-white rounded-t-3xl md:rounded-lg shadow-2xl border md:border border-gray-300 p-4 md:p-3 bottom-0 md:bottom-20 left-0 right-0 md:right-0  w-full md:w-80 "
        style={{ maxHeight: "85vh", minHeight: "auto", height: "auto" }}
      >
        <div className="md:hidden flex justify-center mb-3">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
        <div className="mb-3 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <FiSearch size={18} className="text-gray-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search GIFs..."
            value={gifSearchInput}
            onChange={handleGifSearch}
            className="flex-1 bg-transparent outline-none text-sm min-w-0"
          />
          {gifSearchInput && (
            <button
              type="button"
              onClick={() => {
                setGifSearchInput("");
                fetchFeaturedGifs();
              }}
              className="text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">Mode hemat data</span>
          <button
            type="button"
            onClick={() => setIsDataSaverMode((prev) => !prev)}
            className={`text-[11px] px-2 py-1 rounded-full ${
              isDataSaverMode
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {isDataSaverMode ? "ON" : "OFF"}
          </button>
        </div>
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(85vh - 180px)", minHeight: "200px" }}
        >
          {loadingGifs ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
            </div>
          ) : gifs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No GIFs found
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-2 pb-4">
              {gifs.map((gif, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => insertGifToMessage(gif)}
                  className="relative overflow-hidden rounded-lg hover:opacity-75 transition group h-16 sm:h-20 md:h-24 w-full"
                  title={gif.title || "GIF"}
                >
                  <img
                    src={resolveGifPreview(gif)}
                    alt={gif.title || "GIF"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition"></div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="pt-2 border-t border-gray-200 text-xs text-gray-500 text-center">
          Gif dari Klipy
        </div>
      </div>
    </>
  );
}

export default GifPicker;
