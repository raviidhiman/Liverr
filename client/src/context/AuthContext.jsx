import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
const Ctx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("fh_token");
    if (token) {
      api.get("/auth/me").then(r => setUser(r.data.user)).catch(() => { localStorage.removeItem("fh_token"); localStorage.removeItem("fh_user"); }).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);
  const login = (token, u) => { localStorage.setItem("fh_token", token); localStorage.setItem("fh_user", JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem("fh_token"); localStorage.removeItem("fh_user"); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login, logout, setUser }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
