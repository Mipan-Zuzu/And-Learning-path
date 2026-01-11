import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PUB_API = import.meta.env.VITE_API_PUB
const LOC_API = import.meta.env.VITE_API_LOC

export default function ProtectedRoute({ children }) {
    const navigate = useNavigate()
    useEffect(() => {
        const testing = async () => {
        const res = await fetch(`${PUB_API}/check-session`,{
            method: "GET",
        credentials: "include"
        })
        const data = await res.json()
        if(data.login === "") {
            navigate("/login")
        }
        data.login === false ? navigate("/login") : console.log({ message : "berhasil terverifikasi"})
    }
    testing()
    })

    return children;
}