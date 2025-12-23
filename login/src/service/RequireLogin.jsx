import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProtectedRoute({ children }) {
    const navigate = useNavigate()
    useEffect(() => {
        const testing = async () => {
        const res = await fetch(`${API_URL}/check-session`,{
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
