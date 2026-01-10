import { useEffect, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";



const randomString = (length = 8) =>
  Math.random().toString(36).slice(2, 2 + length);


const SuccsesLogin = () => {
    const navigate = useNavigate();
  const [nama, setNama] = useState(() => {
    return localStorage.getItem("nama") || "";
  });

  const [erName, setErrorName] = useState("")

  
  useEffect(() => {
      if (!nama) {
          const rand = randomString(10);
          setNama(`User${rand}`);
          localStorage.setItem("nama", rand);
        }
    }, []);
    
    const profesiss = localStorage.getItem("profesi")
    const [profesi, setProfesi] = useState(profesiss)

const handleSave = () => {

    if (nama.trim() === "" || profesi.trim() === "") {
        setErrorName("something must have value")
    }else{
        setErrorName("")
        localStorage.setItem("profesi", profesi);
        localStorage.setItem("nama", nama);
        navigate("/dashboard");
    }
    
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-xl">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <Title />

        <div className="mb-4 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
              <FiPlus size={16} />
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Username</label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Profesi</label>
          <input
            type="text"
            value={profesiss}
            onChange={(e) => setProfesi(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        <div className="mt-1 flex flex-col text-red-600">
            <h1>{erName}</h1>
        </div>
        </div>


        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 px-10 py-2 bg-blue-500 text-white rounded-lg cursor-pointer" 
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const Title = () => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">&and profile</h2>
  </div>
);

export default SuccsesLogin;
