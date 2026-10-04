import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import Stars from "../components/common/Stars";
import Avatar from "../components/common/Avatar";
import { gradientFor, categoryIcon, inr, errMsg, dateFmt } from "../utils/helpers";

const TIERS = ["basic", "standard", "premium"];

export default function GigDetailPage() {
  const { id } = useParams();
  const { user, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tier, setTier] = useState("basic");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/gigs/${id}`), api.get(`/reviews/gig/${id}`)])
      .then(([g, r]) => { setGig(g.data.gig); setReviews(r.data.reviews); })
      .catch(() => setGig(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner full />;
  if (!gig) return <div className="container py-20 text-center"><h1 className="text-2xl font-bold">Gig not found</h1><Link to="/gigs" className="btn-primary mt-4 inline-flex">Browse gigs</Link></div>;

  const available = TIERS.filter((t) => gig.packages?.[t]?.price);
  const pkg = gig.packages[tier] || gig.packages.basic;
  const isOwner = user && String(user._id) === String(gig.seller._id);
  const isFav = user?.favorites?.some((x) => String(x) === String(gig._id));

  const order = async () => {
    if (!user) return navigate("/login", { state: { from: `/gigs/${id}` } });
    setError(""); setBusy(true);
    try {
      const r = await api.post("/orders", { gigId: gig._id, packageType: tier, requirements });
      navigate(`/payment/${r.data.order._id}`);
    } catch (e) { setError(errMsg(e)); setBusy(false); }
  };

  const contact = async () => {
    if (!user) return navigate("/login", { state: { from: `/gigs/${id}` } });
    try {
      const r = await api.post("/messages/conversations", { recipientId: gig.seller._id, gigId: gig._id });
      navigate(`/inbox?conv=${r.data.conversation._id}`);
    } catch (e) { setError(errMsg(e)); }
  };

  return (
    <div className="container py-8 grid lg:grid-cols-[1fr_380px] gap-10">
      <div>
        <div className="text-sm text-gray-500 mb-2"><Link to="/gigs" className="hover:underline">Gigs</Link> / <Link className="hover:underline" to={`/gigs?category=${encodeURIComponent(gig.category)}`}>{gig.category}</Link></div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">{gig.title}</h1>
          {user && !isOwner && <button onClick={() => toggleFavorite(gig._id)} title="Save" className="text-3xl leading-none" style={{ color: isFav ? "#e0245e" : "#b5b6ba" }}>{isFav ? "♥" : "♡"}</button>}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Avatar user={gig.seller} size={40} />
          <div>
            <Link to={`/profile/${gig.seller._id}`} className="font-semibold hover:underline">{gig.seller.name}</Link>
            <div className="flex items-center gap-2 text-sm text-gray-500"><Stars rating={gig.seller.rating} count={gig.seller.reviewCount} /> <span>· {gig.seller.sellerLevel}</span></div>
          </div>
        </div>

        <div className="mt-6 rounded-xl overflow-hidden border border-gray-200">
          {gig.coverImage ? <img src={gig.coverImage} alt={gig.title} className="w-full max-h-[420px] object-cover" />
            : <div className="h-64 flex items-center justify-center text-8xl" style={{ background: gradientFor(gig.title) }}>{categoryIcon(gig.category)}</div>}
        </div>

        <h2 className="text-xl font-bold mt-8 mb-3">About this gig</h2>
        <p className="whitespace-pre-line text-gray-700 leading-relaxed">{gig.description}</p>
        {gig.tags?.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{gig.tags.map((t) => <Link key={t} to={`/gigs?search=${encodeURIComponent(t)}`} className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1">{t}</Link>)}</div>}

        {available.length > 1 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-3">Compare packages</h2>
            <div className="overflow-x-auto card">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-left"><th className="p-3"></th>{available.map((t) => <th key={t} className="p-3 capitalize">{gig.packages[t].title || t}</th>)}</tr></thead>
                <tbody>
                  <tr className="border-t"><td className="p-3 font-medium">Price</td>{available.map((t) => <td key={t} className="p-3 font-bold">{inr(gig.packages[t].price)}</td>)}</tr>
                  <tr className="border-t"><td className="p-3 font-medium">Delivery</td>{available.map((t) => <td key={t} className="p-3">{gig.packages[t].deliveryTime} day(s)</td>)}</tr>
                  <tr className="border-t"><td className="p-3 font-medium">Revisions</td>{available.map((t) => <td key={t} className="p-3">{gig.packages[t].revisions}</td>)}</tr>
                  <tr className="border-t"><td className="p-3 font-medium">Includes</td>{available.map((t) => <td key={t} className="p-3 align-top">{(gig.packages[t].features || []).map((f, i) => <div key={i}>✓ {f}</div>)}</td>)}</tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-10 card p-5 flex gap-4">
          <Avatar user={gig.seller} size={64} />
          <div>
            <h2 className="text-lg font-bold">About the seller</h2>
            <Link to={`/profile/${gig.seller._id}`} className="font-semibold hover:underline">{gig.seller.name}</Link>
            <p className="text-sm text-gray-500">{[gig.seller.country, gig.seller.createdAt && `Member since ${dateFmt(gig.seller.createdAt)}`].filter(Boolean).join(" · ")}</p>
            {gig.seller.bio && <p className="text-sm text-gray-700 mt-2">{gig.seller.bio}</p>}
            {!isOwner && <button onClick={contact} className="btn-secondary mt-3 !py-2">Contact me</button>}
          </div>
        </div>

        <h2 className="text-xl font-bold mt-10 mb-3 flex items-center gap-3">Reviews <Stars rating={gig.rating} count={gig.reviewCount} /></h2>
        {reviews.length === 0 ? <p className="text-gray-500 text-sm">No reviews yet.</p> : (
          <div className="space-y-5">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-gray-100 pb-5">
                <div className="flex items-center gap-3"><Avatar user={r.reviewer} size={34} />
                  <div><div className="font-semibold text-sm">{r.reviewer?.name}</div><div className="text-xs text-gray-500">{r.reviewer?.country} {dateFmt(r.createdAt)}</div></div></div>
                <div className="mt-2"><Stars rating={r.rating} /></div>
                <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside>
        <div className="card sticky top-28">
          <div className="flex border-b border-gray-200">
            {available.map((t) => (
              <button key={t} onClick={() => setTier(t)} className={`flex-1 py-3 text-sm font-semibold capitalize border-b-2 -mb-px ${tier === t ? "border-brand text-brand" : "border-transparent text-gray-500"}`}>{t}</button>
            ))}
          </div>
          <div className="p-5">
            <div className="flex justify-between items-baseline"><h3 className="font-bold">{pkg.title || tier}</h3><span className="text-2xl font-bold">{inr(pkg.price)}</span></div>
            {pkg.description && <p className="text-sm text-gray-600 mt-2">{pkg.description}</p>}
            <div className="text-sm text-gray-700 mt-3 flex gap-4"><span>🕒 {pkg.deliveryTime} day delivery</span><span>🔁 {pkg.revisions} revision{pkg.revisions === 1 ? "" : "s"}</span></div>
            {pkg.features?.length > 0 && <ul className="mt-3 text-sm space-y-1">{pkg.features.map((f, i) => <li key={i} className="text-gray-700"><span className="text-brand font-bold">✓</span> {f}</li>)}</ul>}

            {isOwner ? (
              <Link to={`/gigs/${gig._id}/edit`} className="btn-secondary w-full mt-5">Edit this gig</Link>
            ) : (
              <>
                <label className="field-label mt-5">Requirements <span className="font-normal text-gray-400">(optional)</span></label>
                <textarea className="input" rows={3} maxLength={2000} placeholder="Tell the seller what you need..." value={requirements} onChange={(e) => setRequirements(e.target.value)} />
                {error && <div className="alert-error mt-3">{error}</div>}
                <button onClick={order} disabled={busy} className="btn-primary w-full mt-4">{busy ? "Creating order..." : `Continue (${inr(pkg.price)})`}</button>
                <button onClick={contact} className="btn-secondary w-full mt-2">Contact seller</button>
              </>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
