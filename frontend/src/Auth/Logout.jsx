import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../stores/useAuth";

export default function Logout() {
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();
  

  useEffect(() => {
    logout();
    navigate("/welcome"); // or "/login"
  }, [logout, navigate]);

  return null;
}
