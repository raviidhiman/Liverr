import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import Avatar from "../components/common/Avatar";
import { STATUS, inr, dateFmt, errMsg } from "../utils/helpers";

function ReviewForm({ order, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { await api.post("/reviews", { orderId: order._id, rating, comment }); onDone(); }
    catch (e2) { setErr(errMsg(e2)); setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="mt-3 bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="font-semibold text-sm">Rate your experience</div>
      <div className="flex gap-1 text-3xl">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} onClick={() => setRating(n)} style={{ color: n <= rating ? "#ffb33e" : "#d1d5db" }} aria-label={`${n} stars`}>★</button>)}</div>
      <textarea className="input" rows={3} required maxLength={1000} placeholder="Share your experience with this seller..." value={comment} onChange={(e) => setComment(e.target.value)} />
      {err && <div className="alert-error">{err}</div>}
      <button className="btn-primary !py-2" disabled={busy}>{busy ? "Submitting..." : "Submit review"}</button>
    </form>
  );
}

function OrderCard({ order, view, reload }) {
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(""); // "deliver" | "revision" | "review"
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const other = view === "buyer" ? order.seller : order.buyer;
  const st = STATUS[order.status];

  const act = async (status, deliveryNote) => {
    setErr(""); setBusy(true);
    try { await api.put(`/orders/${order._id}/status`, { status, deliveryNote }); setOpen(""); setNote(""); await reload(); }
    catch (e) { setErr(errMsg(e)); }
    finally { setBusy(false); }
  };
  const confirmAct = (status, text) => { if (window.confirm(text)) act(status); };

  return (
    <div className="card p-5">
      <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
        <div className="min-w-0">
          <Link to={`/gigs/${order.gig?._id || ""}`} className="font-semibold hover:underline">{order.gigTitle || order.gig?.title}</Link>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Avatar user={other} size={22} /> {view === "buyer" ? "Seller" : "Buyer"}: {other?.name} <span>· {order.package} package · ordered {dateFmt(order.createdAt)}</span>
          </div>
          {order.dueDate && ["in_progress", "revision"].includes(order.status) && <div className="text-xs text-gray-500 mt-1">Due {dateFmt(order.dueDate)}</div>}
        </div>
        <div className="flex items-center gap-3 md:flex-col md:items-end">
          <span className="text-xl font-bold">{inr(order.price)}</span>
          <span className={`badge ${st.cls}`}>{st.label}</span>
        </div>
      </div>

      {order.requirements && <div className="mt-3 text-sm"><span className="font-semibold">Requirements: </span><span className="text-gray-700 whitespace-pre-line">{order.requirements}</span></div>}
      {order.deliveryNote && ["delivered", "revision", "completed"].includes(order.status) && (
        <div className="mt-3 text-sm bg-purple-50 border border-purple-100 rounded-md p-3"><div className="font-semibold mb-1">Delivery note</div><div className="whitespace-pre-line text-gray-700">{order.deliveryNote}</div></div>
      )}
      {err && <div className="alert-error mt-3">{err}</div>}

      <div className="flex flex-wrap gap-2 mt-4">
        {view === "buyer" && order.status === "awaiting_payment" && <>
          <button className="btn-primary !py-2" onClick={() => navigate(`/payment/${order._id}`)}>Pay now</button>
          <button className="btn-danger !py-2" disabled={busy} onClick={() => confirmAct("cancelled", "Cancel this order?")}>Cancel</button></>}
        {view === "buyer" && order.status === "delivered" && <>
          <button className="btn-primary !py-2" disabled={busy} onClick={() => confirmAct("completed", "Accept the delivery and complete the order?")}>Accept & complete</button>
          {order.revisionsUsed < order.revisionsAllowed
            ? <button className="btn-secondary !py-2" onClick={() => setOpen(open === "revision" ? "" : "revision")}>Request revision ({order.revisionsAllowed - order.revisionsUsed} left)</button>
            : <span className="text-sm text-gray-500 self-center">No revisions left</span>}</>}
        {view === "buyer" && order.status === "completed" && !order.reviewed && <button className="btn-secondary !py-2" onClick={() => setOpen(open === "review" ? "" : "review")}>Leave a review</button>}
        {view === "buyer" && order.status === "completed" && order.reviewed && <span className="text-sm text-emerald-700 self-center">✓ Reviewed</span>}
        {view === "seller" && ["in_progress", "revision"].includes(order.status) && <>
          <button className="btn-primary !py-2" onClick={() => setOpen(open === "deliver" ? "" : "deliver")}>Deliver work</button>
          <button className="btn-danger !py-2" disabled={busy} onClick={() => confirmAct("cancelled", "Cancel this paid order? The buyer will be refunded.")}>Cancel order</button></>}
        <Link to="/inbox" onClick={async (e) => { e.preventDefault(); try { const r = await api.post("/messages/conversations", { recipientId: other._id, gigId: order.gig?._id }); navigate(`/inbox?conv=${r.data.conversation._id}`); } catch { navigate("/inbox"); } }} className="btn-secondary !py-2">Message {view === "buyer" ? "seller" : "buyer"}</Link>
      </div>

      {open === "deliver" && (
        <div className="mt-3 space-y-2">
          <textarea className="input" rows={3} placeholder="Delivery note: links to files, instructions, anything the buyer needs..." value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn-primary !py-2" disabled={busy || !note.trim()} onClick={() => act("delivered", note)}>Send delivery</button>
        </div>
      )}
      {open === "revision" && (
        <div className="mt-3 space-y-2">
          <textarea className="input" rows={3} placeholder="What should the seller change?" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn-primary !py-2" disabled={busy} onClick={() => act("revision", note)}>Send revision request</button>
        </div>
      )}
      {open === "review" && <ReviewForm order={order} onDone={() => { setOpen(""); reload(); }} />}
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [view, setView] = useState(user.role === "seller" ? "seller" : "buyer");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const load = async (v = view) => {
    try { const r = await api.get(`/orders/${v}`); setOrders(r.data.orders); setError(""); }
    catch (e) { setError(errMsg(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { setLoading(true); load(view); /* eslint-disable-next-line */ }, [view]);

  const shown = orders.filter((o) => filter === "all" || (filter === "active" ? ["in_progress", "delivered", "revision", "awaiting_payment"].includes(o.status) : o.status === filter));

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
        {user.role === "seller" && (
          <div className="inline-flex border border-gray-300 rounded-md overflow-hidden text-sm font-semibold">
            {[["seller", "Selling"], ["buyer", "Buying"]].map(([v, l]) => <button key={v} onClick={() => setView(v)} className={`px-4 py-2 ${view === v ? "bg-brand-ink text-white" : "bg-white"}`}>{l}</button>)}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mb-5 text-sm">
        {[["all", "All"], ["active", "Active"], ["completed", "Completed"], ["cancelled", "Cancelled"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`px-3 py-1.5 rounded-full border ${filter === v ? "bg-brand text-white border-brand" : "border-gray-300"}`}>{l}</button>
        ))}
      </div>
      {error && <div className="alert-error mb-4">{error}</div>}
      {loading ? <Spinner /> : shown.length === 0 ? (
        <div className="card p-12 text-center text-gray-500"><div className="text-5xl mb-2">📦</div>No orders here yet.{view === "buyer" && <div><Link to="/gigs" className="btn-primary mt-4 inline-flex">Find a service</Link></div>}</div>
      ) : <div className="space-y-4">{shown.map((o) => <OrderCard key={o._id} order={o} view={view} reload={() => load(view)} />)}</div>}
    </div>
  );
}
