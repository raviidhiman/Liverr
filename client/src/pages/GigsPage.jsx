import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import GigCard from "../components/gigs/GigCard";
import Spinner from "../components/common/Spinner";
import { CATEGORIES } from "../utils/helpers";

const SORTS = [["newest", "Newest"], ["popular", "Most popular"], ["rating", "Best rated"], ["price_asc", "Price: low to high"], ["price_desc", "Price: high to low"]];

export default function GigsPage() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ gigs: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [price, setPrice] = useState({ min: params.get("min") || "", max: params.get("max") || "" });

  const get = (k, d = "") => params.get(k) || d;
  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  };

  useEffect(() => {
    setLoading(true); setError("");
    api.get(`/gigs?${params.toString()}&limit=12`)
      .then((r) => setData(r.data))
      .catch(() => setError("Could not load gigs. Is the server running?"))
      .finally(() => setLoading(false));
  }, [params]);

  const page = Number(get("page", 1));

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-bold">{get("search") ? `Results for "${get("search")}"` : get("category") || "All services"}</h1>
      <p className="text-gray-500 text-sm mt-1">{data.total} service{data.total === 1 ? "" : "s"} available</p>

      <div className="grid lg:grid-cols-[250px_1fr] gap-8 mt-6">
        <aside className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 text-sm">Category</h3>
            <div className="space-y-1">
              <button onClick={() => set({ category: "" })} className={`block text-sm w-full text-left px-2 py-1 rounded ${!get("category") ? "bg-green-50 text-brand font-semibold" : "hover:bg-gray-50"}`}>All categories</button>
              {CATEGORIES.map((c) => (
                <button key={c.name} onClick={() => set({ category: c.name })} className={`block text-sm w-full text-left px-2 py-1 rounded ${get("category") === c.name ? "bg-green-50 text-brand font-semibold" : "hover:bg-gray-50"}`}>{c.icon} {c.name}</button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm">Budget (₹)</h3>
            <div className="flex gap-2">
              <input className="input !py-2" type="number" min="0" placeholder="Min" value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} />
              <input className="input !py-2" type="number" min="0" placeholder="Max" value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} />
            </div>
            <button onClick={() => set({ min: price.min, max: price.max })} className="btn-secondary w-full mt-2 !py-1.5">Apply</button>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm">Delivery time</h3>
            <select className="input !py-2" value={get("delivery")} onChange={(e) => set({ delivery: e.target.value })}>
              <option value="">Any</option><option value="1">Up to 1 day</option><option value="3">Up to 3 days</option><option value="7">Up to 7 days</option>
            </select>
          </div>
          {(get("search") || get("category") || get("min") || get("max") || get("delivery")) && (
            <button onClick={() => { setPrice({ min: "", max: "" }); setParams({}); }} className="text-sm text-red-600 font-semibold">Clear all filters</button>
          )}
        </aside>

        <div>
          <div className="flex justify-end mb-4">
            <label className="text-sm text-gray-500 flex items-center gap-2">Sort by
              <select className="input !w-auto !py-1.5" value={get("sort", "newest")} onChange={(e) => set({ sort: e.target.value })}>
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>
          {error && <div className="alert-error">{error}</div>}
          {loading ? <Spinner /> : data.gigs.length === 0 && !error ? (
            <div className="text-center py-16 text-gray-500"><div className="text-5xl mb-2">🔎</div>No services match your filters.</div>
          ) : (
            <div className="gig-grid">{data.gigs.map((g) => <GigCard key={g._id} gig={g} />)}</div>
          )}
          {data.pages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button className="btn-secondary" disabled={page <= 1} onClick={() => set({ page: String(page - 1) })}>← Prev</button>
              <span className="text-sm text-gray-600">Page {page} of {data.pages}</span>
              <button className="btn-secondary" disabled={page >= data.pages} onClick={() => set({ page: String(page + 1) })}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
