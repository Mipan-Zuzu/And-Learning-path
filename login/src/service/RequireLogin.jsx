import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const testing = async () => {
      try {
        const res = await fetch(
          `${PUB_API}/check-session`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!data.login) {
          navigate("/login");
        } else {
          setVerified(true);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        navigate("/login");
      }
    };

    testing();
  }, [navigate]);

  if (!verified) return null

  return children;
}
