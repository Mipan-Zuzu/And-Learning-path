import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PUB_API = import.meta.env.VITE_API_PUB
const LOC_API = import.meta.env.VITE_API_LOC

export default function ProtectedRoute({ children }) {
    const navigate = useNavigate()
    useEffect(() => {
        const testing = async () => {
        const res = await fetch(`${LOC_API}/check-session`,{
            method: "GET",
        credentials: "include"
        })
        const data = await res.json()
        if(data.login === "") {
            navigate("/")
        }
        data.login === false ? navigate("/") : console.log({ message : "berhasil terverifikasi"})
    }
    testing()
    })

    return children;
}
