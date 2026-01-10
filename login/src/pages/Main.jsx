import { useState } from "react";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css";
import Typewriter from "typewriter-effect";
import { Link } from "react-router-dom";

export default function Main() {
  const PUB_API = import.meta.env.VITE_API_PUB;
  const LOC_API = import.meta.env.VITE_API_LOC;

  // const testing = () => {
  // fetch("https://and-api-ten.vercel.app/logout", {
  //   method: "GET",
  //   credentials: "include"
  // })
  // .then(() => {
  //   window.location.href = "/login"
  // })
  // }
  return <Backgorund></Backgorund>;
}

const Backgorund = () => {
  const [profesi, setProfesi] = useState(
    () => localStorage.getItem("profesi") ?? "profesi"
  );

  const pilihProfesi = (role) => {
    localStorage.setItem("profesi", role);
    setProfesi(role);
  };

  return (
    <div className="crt-bg min-h-screen flex items-center justify-center font-mono overflow-hidden ">
      <img
        className="absolute -ml-80 -mt-50"
        width={50}
        src="/gif/mascot.gif"
        alt=""
      />
      <div className="absolute -mt-96 pixels font-bold fade"></div>
      <div className="border-3 mt-15 border-gray-500 flex flex-col justify-center items-center z-10 p-5 buble">
        {" "}
        <div className="flex gap-1.5 -ml-80">
          {" "}
          <a className="w-2 h-2 bg-[#1B1B1B]"></a>{" "}
          <a className="w-2 h-2 bg-[#1B1B1B]"></a>{" "}
          <a className="w-2 h-2 bg-[#1B1B1B]"></a> <br />{" "}
        </div>{" "}
        <div className="w-100 border-b-2 border-gray-900"></div>
        <div className="pixels font-medium text-center">
          <h1>Let's go start from here</h1>
          <p className="text-sm -mt-2 text-gray-700">
            Learning becomes easier after using &And <br /> Let’s create the
            future from here
          </p>
        </div>
        <div className="pixels mt-10 mb-3">
          Tell me who you are{" "}
          <span className="bg-[#E9A8A0] px-2">
            {profesi === "" ? "professi" : profesi}
          </span>
        </div>
        <RadioInput pilihProfesi={pilihProfesi} />
        <div
          className={`mt-5 ml-60 ${
            profesi === "profesi" ? "opacity-0" : "opacity-100"
          }`}
        >
          <Link
            to={"/profile"}
            className="p-1 pl-5 pr-5 bg-[#1B1B1B] text-white cursor-pointer pixels text-sm hover:bg-white hover:border duration-300 hover:text-black "
          >
            Select
          </Link>
        </div>
      </div>
    </div>
  );
};

const RadioInput = ({ pilihProfesi }) => {
  const [clicked, setClicked] = useState(null);
  const playSound = () => {
    const audio = new Audio("/sound/card-flip.mp3");
    audio.play();
  };

  const handleClick = (role) => {
    setClicked(role);
    pilihProfesi(role);
    setTimeout(() => setClicked(null), 1000);
  };

  return (
    <div className="flex justify-center gap-4">
      <img
        width={100}
        src="/img/muridCrd.png"
        alt="murid"
        onClick={() => {
          handleClick("murid");
          playSound();
        }}
        className={`transition-transform duration-300 cursor-pointer ${
          clicked === "murid" ? "animate-card" : ""
        } hover:scale-105 hover:rotate-2`}
      />

      <img
        width={100}
        src="/img/guruCrd.png"
        alt="guru"
        onClick={() => {
          handleClick("guru");
          playSound();
        }}
        className={`transition-transform duration-300 cursor-pointer ${
          clicked === "guru" ? "animate-card" : ""
        } hover:scale-105`}
      />

      <img
        width={100}
        src="/img/PekerjaCrd.png"
        alt="pekerja"
        onClick={() => {
          handleClick("pekerja");
          playSound();
        }}
        className={`transition-transform duration-300 cursor-pointer ${
          clicked === "pekerja" ? "animate-card" : ""
        } hover:scale-105 hover:rotate-2`}
      />
    </div>
  );
};
