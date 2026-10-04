import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("liverr_token")) { setLoading(false); return; }
    api.get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem("liverr_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = (token, u) => { localStorage.setItem("liverr_token", token); setUser(u); };
  const logout = () => { localStorage.removeItem("liverr_token"); setUser(null); };
  const refreshUser = useCallback(async () => {
    const r = await api.get("/auth/me");
    setUser(r.data.user);
    return r.data.user;
  }, []);
  const toggleFavorite = async (gigId) => {
    const r = await api.post(`/users/favorites/${gigId}`);
    setUser((u) => ({ ...u, favorites: r.data.favorites }));
    return r.data.added;
  };

  return <Ctx.Provider value={{ user, loading, login, logout, refreshUser, toggleFavorite }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
