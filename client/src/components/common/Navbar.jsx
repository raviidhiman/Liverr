import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import Logo from "./Logo";
import Avatar from "./Avatar";
import { CATEGORIES } from "../../utils/helpers";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);
  const [unread, setUnread] = useState(0);
  const menuRef = useRef(null);

  // Poll unread message count while logged in
  useEffect(() => {
    if (!user) { setUnread(0); return; }
    let alive = true;
    const load = () => api.get("/messages/unread").then((r) => alive && setUnread(r.data.count)).catch(() => {});
    load();
    const t = setInterval(load, 10000);
    return () => { alive = false; clearInterval(t); };
  }, [user, location.pathname]);

  useEffect(() => { setMenu(false); }, [location.pathname]);
  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    navigate(`/gigs${q.trim() ? `?search=${encodeURIComponent(q.trim())}` : ""}`);
  };
  const linkCls = ({ isActive }) => `text-sm font-semibold hover:text-brand ${isActive ? "text-brand" : "text-gray-700"}`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="container flex items-center gap-4 h-[68px]">
        <Logo />
        <form onSubmit={submit} className="flex-1 max-w-xl hidden sm:flex">
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input rounded-r-none" placeholder="What service are you looking for today?" />
          <button className="btn-primary rounded-l-none px-4" aria-label="Search">🔍</button>
        </form>
        <nav className="ml-auto flex items-center gap-4 md:gap-5">
          <NavLink to="/gigs" className={linkCls}>Explore</NavLink>
          {user ? (
            <>
              <NavLink to="/inbox" className={linkCls}>
                <span className="relative">Messages{unread > 0 && <span className="absolute -top-2.5 -right-4 bg-brand text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">{unread}</span>}</span>
              </NavLink>
              <NavLink to="/orders" className={`${linkCls} hidden md:block`}>Orders</NavLink>
              <NavLink to="/favorites" className={`${linkCls} hidden md:block`}>Saved</NavLink>
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenu((m) => !m)} className="flex items-center" aria-label="Account menu"><Avatar user={user} size={34} /></button>
                {menu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 text-sm">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <div className="font-semibold truncate">{user.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                    </div>
                    <Link className="block px-4 py-2 hover:bg-gray-50" to="/dashboard">Dashboard</Link>
                    {user.role === "seller" && <Link className="block px-4 py-2 hover:bg-gray-50" to="/my-gigs">My gigs</Link>}
                    {user.role === "seller" && <Link className="block px-4 py-2 hover:bg-gray-50" to="/gigs/new">Create a gig</Link>}
                    <Link className="block px-4 py-2 hover:bg-gray-50 md:hidden" to="/orders">Orders</Link>
                    <Link className="block px-4 py-2 hover:bg-gray-50 md:hidden" to="/favorites">Saved gigs</Link>
                    <Link className="block px-4 py-2 hover:bg-gray-50" to={`/profile/${user._id}`}>Profile</Link>
                    <button onClick={() => { logout(); navigate("/"); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 border-t border-gray-100 mt-1">Sign out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-brand">Sign in</Link>
              <Link to="/register" className="btn-secondary !py-2 !px-4">Join</Link>
            </>
          )}
        </nav>
      </div>
      <div className="hidden lg:block border-t border-gray-100">
        <div className="container flex justify-between h-10 items-center text-[13px] text-gray-600 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <Link key={c.name} to={`/gigs?category=${encodeURIComponent(c.name)}`} className="hover:text-brand whitespace-nowrap px-1">{c.name}</Link>
          ))}
        </div>
      </div>
    </header>
  );
}
