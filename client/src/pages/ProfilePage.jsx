import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import Stars from "../components/common/Stars";
import Avatar from "../components/common/Avatar";
import GigCard from "../components/gigs/GigCard";
import { dateFmt, errMsg, fileToDataUrl } from "../utils/helpers";

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me, refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const isMe = me && String(me._id) === id;

  const load = () => api.get(`/users/${id}`).then((r) => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false));
  useEffect(() => { setLoading(true); setEditing(false); load(); /* eslint-disable-next-line */ }, [id]);

  const startEdit = () => {
    const u = data.user;
    setForm({ name: u.name, bio: u.bio || "", country: u.country || "", skills: (u.skills || []).join(", "), languages: (u.languages || []).join(", "), avatar: u.avatar || "" });
    setMsg({ type: "", text: "" });
    setEditing(true);
  };

  const onAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const url = await fileToDataUrl(file, 300, 0.8); setForm((f) => ({ ...f, avatar: url })); }
    catch (err) { setMsg({ type: "error", text: err.message }); }
  };

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setMsg({ type: "", text: "" });
    try {
      await api.put("/users/profile/update", form);
      await Promise.all([load(), refreshUser()]);
      setEditing(false); setMsg({ type: "success", text: "Profile updated" });
    } catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner full />;
  if (!data) return <div className="container py-20 text-center"><h1 className="text-2xl font-bold">User not found</h1></div>;
  const { user, gigs, reviews } = data;

  return (
    <div className="container py-8 grid lg:grid-cols-[320px_1fr] gap-8">
      <aside>
        <div className="card p-6 text-center">
          <div className="flex justify-center"><Avatar user={editing ? { ...user, avatar: form.avatar } : user} size={110} /></div>
          {!editing ? (
            <>
              <h1 className="text-xl font-bold mt-3">{user.name}</h1>
              <div className="text-sm text-gray-500 capitalize">{user.role === "seller" ? user.sellerLevel : "Buyer"}</div>
              {user.role === "seller" && <div className="mt-2 flex justify-center"><Stars rating={user.rating} count={user.reviewCount} /></div>}
              <div className="text-sm text-gray-500 mt-3 space-y-1">
                {user.country && <div>📍 {user.country}</div>}
                <div>🗓 Member since {dateFmt(user.createdAt)}</div>
                {user.role === "seller" && <div>✅ {user.completedOrders} orders completed</div>}
              </div>
              {isMe && <button onClick={startEdit} className="btn-secondary w-full mt-4">Edit profile</button>}
              {msg.text && <div className={`mt-3 ${msg.type === "error" ? "alert-error" : "alert-success"}`}>{msg.text}</div>}
            </>
          ) : (
            <form onSubmit={save} className="text-left space-y-3 mt-4">
              <div><label className="field-label">Photo</label><input type="file" accept="image/*" onChange={onAvatar} className="text-xs" />
                {form.avatar && <button type="button" onClick={() => setForm({ ...form, avatar: "" })} className="text-xs text-red-600 block mt-1">Remove photo</button>}</div>
              <div><label className="field-label">Name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="field-label">Country</label><input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
              <div><label className="field-label">Bio</label><textarea className="input" rows={4} maxLength={500} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
              <div><label className="field-label">Skills</label><input className="input" placeholder="comma separated" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
              <div><label className="field-label">Languages</label><input className="input" placeholder="comma separated" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} /></div>
              {msg.text && <div className="alert-error">{msg.text}</div>}
              <div className="flex gap-2"><button className="btn-primary flex-1" disabled={saving}>{saving ? "Saving..." : "Save"}</button><button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button></div>
            </form>
          )}
        </div>
        {!editing && (user.skills?.length > 0 || user.languages?.length > 0) && (
          <div className="card p-5 mt-4 text-sm space-y-3">
            {user.skills?.length > 0 && <div><div className="font-semibold mb-1.5">Skills</div><div className="flex flex-wrap gap-1.5">{user.skills.map((s) => <span key={s} className="bg-gray-100 rounded-full px-2.5 py-1 text-xs">{s}</span>)}</div></div>}
            {user.languages?.length > 0 && <div><div className="font-semibold mb-1">Languages</div><div className="text-gray-600">{user.languages.join(", ")}</div></div>}
          </div>
        )}
      </aside>

      <div>
        {user.bio && <div className="card p-6 mb-6"><h2 className="font-bold text-lg mb-2">About</h2><p className="text-gray-700 whitespace-pre-line">{user.bio}</p></div>}
        {user.role === "seller" && (
          <>
            <h2 className="text-xl font-bold mb-4">{isMe ? "My" : `${user.name.split(" ")[0]}'s`} gigs ({gigs.length})</h2>
            {gigs.length === 0 ? <p className="text-gray-500">No active gigs.</p> : <div className="gig-grid">{gigs.map((g) => <GigCard key={g._id} gig={g} />)}</div>}
            <h2 className="text-xl font-bold mt-10 mb-4">Reviews ({user.reviewCount})</h2>
            {reviews.length === 0 ? <p className="text-gray-500 text-sm">No reviews yet.</p> : (
              <div className="space-y-5">{reviews.map((r) => (
                <div key={r._id} className="border-b border-gray-100 pb-5">
                  <div className="flex items-center gap-3"><Avatar user={r.reviewer} size={34} /><div><div className="font-semibold text-sm">{r.reviewer?.name}</div><div className="text-xs text-gray-500">{dateFmt(r.createdAt)}</div></div></div>
                  <div className="mt-2"><Stars rating={r.rating} /></div><p className="text-sm text-gray-700 mt-1">{r.comment}</p>
                </div>))}</div>
            )}
          </>
        )}
        {user.role !== "seller" && !user.bio && <p className="text-gray-500">This member is a buyer on Liverr.</p>}
      </div>
    </div>
  );
}
