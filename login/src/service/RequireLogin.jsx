import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://fixed-ant-ands-9cc7ffdd.koyeb.app";

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
            navigate("/")
        }
        data.login === false ? navigate("/") : console.log({ message : "berhasil terverifikasi"})
    }
    testing()
    })

    return children;
}
