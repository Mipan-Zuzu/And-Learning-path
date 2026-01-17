import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const PUB_API = import.meta.env.VITE_API_PUB;

  useEffect(() => {
    const testing = async () => {
      try {
        const res = await fetch(
          `https://personal-talya-and-path-learning-38ee2f3f.koyeb.app/check-session`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!data.login) {
          navigate("/");
        } else {
          setVerified(true);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        navigate("/");
      }
    };

    testing();
  }, [navigate]);

  if (!verified) return null

  return children;
}
