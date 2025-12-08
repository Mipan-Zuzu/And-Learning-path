import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const navigate = useNavigate()
    useEffect(() => {
        const testing = async () => {
        const res = await fetch("https://and-api-ten.vercel.app/check-session",{
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
