import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Spinner from "../components/common/Spinner";
import Stars from "../components/common/Stars";
import { gradientFor, categoryIcon, inr, errMsg } from "../utils/helpers";

export default function MyGigsPage() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = () => api.get("/gigs/my-gigs").then((r) => setGigs(r.data.gigs)).catch((e) => setMsg({ type: "error", text: errMsg(e) })).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggle = async (g) => {
    try { await api.put(`/gigs/${g._id}`, { isActive: !g.isActive }); load(); }
    catch (e) { setMsg({ type: "error", text: errMsg(e) }); }
  };
  const remove = async (g) => {
    if (!window.confirm(`Delete "${g.title}"?`)) return;
    try { const r = await api.delete(`/gigs/${g._id}`); setMsg({ type: "success", text: r.data.message }); load(); }
    catch (e) { setMsg({ type: "error", text: errMsg(e) }); }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">My gigs</h1>
        <Link to="/gigs/new" className="btn-primary">+ Create new gig</Link>
      </div>
      {msg.text && <div className={`mb-4 ${msg.type === "error" ? "alert-error" : "alert-success"}`}>{msg.text}</div>}
      {loading ? <Spinner /> : gigs.length === 0 ? (
        <div className="card p-12 text-center text-gray-500"><div className="text-5xl mb-2">🚀</div><p>You have not created any gigs yet.</p><Link to="/gigs/new" className="btn-primary mt-4 inline-flex">Create your first gig</Link></div>
      ) : (
        <div className="space-y-3">
          {gigs.map((g) => (
            <div key={g._id} className="card p-4 flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="w-full sm:w-32 h-20 rounded-md overflow-hidden flex-shrink-0">
                {g.coverImage ? <img src={g.coverImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: gradientFor(g.title) }}>{categoryIcon(g.category)}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/gigs/${g._id}`} className="font-semibold hover:underline line-clamp-2">{g.title}</Link>
                <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>{g.category}</span><span>From {inr(g.packages?.basic?.price)}</span><span>{g.orderCount} orders</span><Stars rating={g.rating} count={g.reviewCount} />
                  <span className={`badge ${g.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"}`}>{g.isActive ? "Active" : "Paused"}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link to={`/gigs/${g._id}/edit`} className="btn-secondary !py-2 !px-4">Edit</Link>
                <button onClick={() => toggle(g)} className="btn-secondary !py-2 !px-4">{g.isActive ? "Pause" : "Activate"}</button>
                <button onClick={() => remove(g)} className="btn-danger !py-2 !px-4">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
