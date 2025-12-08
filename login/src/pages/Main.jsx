import { useState} from "react";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css";
import Typewriter from "typewriter-effect";


export default function Main () {
  // const testing = () => {
  // fetch("https://and-api-ten.vercel.app/logout", {
  //   method: "GET",
  //   credentials: "include" 
  // })
  // .then(() => {
  //   window.location.href = "/login"
  // })
// }
  return (
      <Backgorund> 
      </Backgorund>
  );
};

const Backgorund = () => {
  const [profesi, setProfesi] = useState(() => localStorage.getItem("profesi") ?? "profesi");

  const pilihProfesi = (role) => {
    localStorage.setItem("profesi", role); 
    setProfesi(role);                     
  };

  return (
    <div className="crt-bg min-h-screen flex items-center justify-center font-mono">
        <div className="absolute -mt-96 pixels font-bold fade">
              <Typewriter
      options={{
        strings: ["Hi User UwU", "Welcome this is &And"],
        autoStart: true,
        loop: true,   
      }}
    />
        </div>
        <div className="border-3 mt-10 border-gray-500 flex flex-col justify-center items-center z-10 p-5 buble"> <div className="flex gap-1.5 -ml-80"> <a className="w-2 h-2 bg-[#1B1B1B]"></a> <a className="w-2 h-2 bg-[#1B1B1B]"></a> <a className="w-2 h-2 bg-[#1B1B1B]"></a> <br /> </div> <div className="w-100 border-b-2 border-gray-900"></div>

        <div className="pixels font-medium text-center">
          <h1>Let's go start from here</h1>
          <p className="text-sm -mt-2 text-gray-700">
            Learning is more easy after you using &And <br /> here we go make future
          </p>
        </div>
        <div className="pixels mt-10 mb-3">
          I should know what your <span className="bg-[#E9A8A0] px-2">{profesi === "" ? "professi" : profesi}</span>
        </div>
        <RadioInput pilihProfesi={pilihProfesi} />
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
          handleClick("murid")
          playSound()
        }}
        className={`transition-transform duration-300 cursor-pointer ${
          clicked === "murid" ? "animate-card" : ""
        } hover:scale-105`}
      />

      <img
        width={100}
        src="/img/guruCrd.png"
        alt="guru"
        onClick={() => {
          handleClick("guru")
          playSound()
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
           handleClick("pekerja")
           playSound()
        }}
        className={`transition-transform duration-300 cursor-pointer ${
          clicked === "pekerja" ? "animate-card" : ""
        } hover:scale-105`}
      />
    </div>
  );
};
