import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const testing = async () => {
    const res = await fetch("https://and-api-ten.vercel.app/check-session", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Server error:", res.status);
      return navigate("/login");
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Response is not JSON!");
      return navigate("/login");
    }

    const data = await res.json();

    if (!data.login) {
      navigate("/login");
    } else {
      console.log("berhasil terverifikasi");
    }
  }
  testing()

  return children;
}
