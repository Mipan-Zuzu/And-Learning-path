import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(
          "https://fixed-ant-ands-9cc7ffdd.koyeb.app/check-session",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          navigate("/login");
          return;
        }

        const data = await res.json();

        if (!data.login) {
          navigate("/login");
        } else {
          setLoading(false);
        }
      } catch {
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate]);

  if (loading) return null; // atau loading spinner

  return children;
}
