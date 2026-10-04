import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Spinner from "../components/common/Spinner";
import { CATEGORIES, errMsg, fileToDataUrl } from "../utils/helpers";

const emptyPkg = (price = "", days = 3) => ({ title: "", description: "", price, deliveryTime: days, revisions: 1, features: "" });
const TIERS = [["basic", "Basic", true], ["standard", "Standard", false], ["premium", "Premium", false]];

export default function CreateGigPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", category: CATEGORIES[0].name, description: "", tags: "", coverImage: "", isActive: true });
  const [pkgs, setPkgs] = useState({ basic: emptyPkg(), standard: emptyPkg(), premium: emptyPkg() });
  const [enabled, setEnabled] = useState({ basic: true, standard: false, premium: false });

  useEffect(() => {
    if (!editing) return;
    api.get(`/gigs/${id}`).then((r) => {
      const g = r.data.gig;
      setForm({ title: g.title, category: g.category, description: g.description, tags: (g.tags || []).join(", "), coverImage: g.coverImage || "", isActive: g.isActive });
      const next = { basic: emptyPkg(), standard: emptyPkg(), premium: emptyPkg() };
      const en = { basic: true, standard: false, premium: false };
      for (const [t] of TIERS) if (g.packages?.[t]?.price) { next[t] = { ...g.packages[t], features: (g.packages[t].features || []).join("\n") }; en[t] = true; }
      setPkgs(next); setEnabled(en);
    }).catch(() => setError("Could not load this gig")).finally(() => setLoading(false));
  }, [id, editing]);

  const setPkg = (t, patch) => setPkgs((p) => ({ ...p, [t]: { ...p[t], ...patch } }));

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const url = await fileToDataUrl(file, 1000, 0.8); setForm((f) => ({ ...f, coverImage: url })); }
    catch (err) { setError(err.message); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const packages = {};
    for (const [t, label] of TIERS) {
      if (!enabled[t]) continue;
      const p = pkgs[t];
      if (!(Number(p.price) > 0)) return setError(`${label} package needs a price greater than 0`);
      packages[t] = { ...p, price: Number(p.price), deliveryTime: Number(p.deliveryTime) || 1, revisions: Number(p.revisions) || 0, features: String(p.features).split("\n").map((s) => s.trim()).filter(Boolean) };
    }
    setSaving(true);
    try {
      const body = { ...form, packages };
      const r = editing ? await api.put(`/gigs/${id}`, body) : await api.post("/gigs", body);
      navigate(`/gigs/${r.data.gig._id}`);
    } catch (err) { setError(errMsg(err)); setSaving(false); }
  };

  if (loading) return <Spinner full />;

  return (
    <div className="container py-8 max-w-3xl">
      <Link to="/my-gigs" className="text-sm text-gray-500">← My gigs</Link>
      <h1 className="text-2xl md:text-3xl font-bold mt-1 mb-6">{editing ? "Edit gig" : "Create a new gig"}</h1>
      <form onSubmit={submit} className="space-y-6">
        {error && <div className="alert-error">{error}</div>}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-lg">Overview</h2>
          <div><label className="field-label">Gig title</label>
            <input className="input" required maxLength={100} placeholder="I will design a modern logo for your brand" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <p className="field-hint">{form.title.length}/100</p></div>
          <div><label className="field-label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}</select></div>
          <div><label className="field-label">Description</label>
            <textarea className="input" rows={6} required maxLength={2000} placeholder="Describe what you offer, your process and what the buyer gets..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <p className="field-hint">{form.description.length}/2000</p></div>
          <div><label className="field-label">Search tags</label>
            <input className="input" placeholder="logo, branding, minimal (comma separated, max 8)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
          <div><label className="field-label">Cover image</label>
            {form.coverImage && <img src={form.coverImage} alt="cover preview" className="w-full max-h-56 object-cover rounded-lg mb-2" />}
            <input type="file" accept="image/*" onChange={onImage} className="text-sm" />
            <p className="field-hint">Optional. Images are resized automatically. A coloured placeholder is used if you skip this.</p>
            {form.coverImage && <button type="button" onClick={() => setForm({ ...form, coverImage: "" })} className="text-sm text-red-600 mt-1">Remove image</button>}</div>
        </div>

        <div className="card p-6 space-y-5">
          <h2 className="font-bold text-lg">Packages & pricing (₹ INR)</h2>
          {TIERS.map(([t, label, always]) => (
            <div key={t} className={`border rounded-lg p-4 ${enabled[t] ? "border-brand/50" : "border-gray-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{label}</h3>
                {always ? <span className="text-xs text-gray-500">Required</span> : (
                  <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={enabled[t]} onChange={(e) => setEnabled({ ...enabled, [t]: e.target.checked })} /> Offer this package</label>)}
              </div>
              {enabled[t] && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="field-label">Package name</label><input className="input" maxLength={60} value={pkgs[t].title} onChange={(e) => setPkg(t, { title: e.target.value })} placeholder={`${label} package`} /></div>
                  <div><label className="field-label">Price (₹)</label><input className="input" type="number" min="1" required value={pkgs[t].price} onChange={(e) => setPkg(t, { price: e.target.value })} /></div>
                  <div className="sm:col-span-2"><label className="field-label">Short description</label><input className="input" maxLength={300} value={pkgs[t].description} onChange={(e) => setPkg(t, { description: e.target.value })} /></div>
                  <div><label className="field-label">Delivery (days)</label><input className="input" type="number" min="1" required value={pkgs[t].deliveryTime} onChange={(e) => setPkg(t, { deliveryTime: e.target.value })} /></div>
                  <div><label className="field-label">Revisions</label><input className="input" type="number" min="0" value={pkgs[t].revisions} onChange={(e) => setPkg(t, { revisions: e.target.value })} /></div>
                  <div className="sm:col-span-2"><label className="field-label">What is included (one per line)</label><textarea className="input" rows={3} value={pkgs[t].features} onChange={(e) => setPkg(t, { features: e.target.value })} /></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {editing && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Gig is active (visible to buyers)</label>}
        <div className="flex gap-3">
          <button className="btn-primary" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Publish gig"}</button>
          <Link to="/my-gigs" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
