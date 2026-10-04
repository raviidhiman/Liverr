import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import GigCard from "../components/gigs/GigCard";
import { CATEGORIES } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

const POPULAR = ["logo design", "website", "SEO", "react", "video editing"];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/gigs?sort=popular&limit=8").then((r) => setGigs(r.data.gigs)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const search = (term) => navigate(`/gigs?search=${encodeURIComponent(term)}`);

  return (
    <div>
      <section className="text-white" style={{ background: "linear-gradient(135deg,#0e3d28 0%,#145c3a 55%,#1dbf73 130%)" }}>
        <div className="container py-20 md:py-28">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl">Find the perfect <span className="italic text-green-300">freelance</span> services for your business</h1>
          <form onSubmit={(e) => { e.preventDefault(); search(q); }} className="mt-8 flex max-w-xl">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Try "logo design"' className="flex-1 px-4 py-3.5 rounded-l-md text-gray-900 outline-none" />
            <button className="bg-brand hover:bg-brand-dark px-6 font-semibold rounded-r-md">Search</button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2 items-center text-sm">
            <span className="opacity-80">Popular:</span>
            {POPULAR.map((p) => <button key={p} onClick={() => search(p)} className="border border-white/50 rounded-full px-3 py-1 hover:bg-white hover:text-brand-ink transition">{p}</button>)}
          </div>
        </div>
      </section>

      <section className="container py-14">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Explore categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((c) => (
            <Link key={c.name} to={`/gigs?category=${encodeURIComponent(c.name)}`} className="card card-hover p-5 text-center">
              <div className="text-4xl mb-2">{c.icon}</div>
              <div className="text-sm font-semibold">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container pb-6">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Popular gigs</h2>
          <Link to="/gigs" className="text-brand font-semibold text-sm">See all →</Link>
        </div>
        {loading ? <div className="flex justify-center py-10"><div className="spinner" /></div>
          : gigs.length === 0 ? <p className="text-gray-500">No gigs yet. Be the first to <Link to="/register" className="text-brand font-semibold">create one</Link>!</p>
          : <div className="gig-grid">{gigs.map((g) => <GigCard key={g._id} gig={g} />)}</div>}
      </section>

      <section className="bg-gray-50 mt-12">
        <div className="container py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How Liverr works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[["1", "Find the right service", "Browse categories or search for exactly what you need."], ["2", "Order & pay securely", "Pick a package, share your requirements and pay through Razorpay."], ["3", "Get it delivered", "Chat with your seller, request revisions and approve when you are happy."]].map(([n, t, d]) => (
              <div key={n} className="card p-6">
                <div className="w-10 h-10 rounded-full bg-brand text-white font-bold flex items-center justify-center mb-3">{n}</div>
                <h3 className="font-bold mb-1">{t}</h3><p className="text-sm text-gray-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!user && (
        <section className="container py-14">
          <div className="rounded-2xl p-10 md:p-14 text-white text-center" style={{ background: "linear-gradient(135deg,#222325,#3b3d40)" }}>
            <h2 className="text-3xl font-bold">Ready to start earning?</h2>
            <p className="mt-2 text-gray-300">Offer your skills to thousands of buyers on Liverr.</p>
            <Link to="/register" className="btn-primary mt-6 inline-flex">Become a seller</Link>
          </div>
        </section>
      )}
    </div>
  );
}
