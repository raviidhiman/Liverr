import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import { STATUS, inr, dateFmt, errMsg } from "../utils/helpers";

const Stat = ({ label, value, sub }) => (
  <div className="card p-5"><div className="text-sm text-gray-500">{label}</div><div className="text-2xl font-extrabold mt-1">{value}</div>{sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}</div>
);

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isSeller = user.role === "seller";

  useEffect(() => {
    Promise.all([api.get("/users/me/stats"), api.get(isSeller ? "/orders/seller" : "/orders/buyer")])
      .then(([s, o]) => { setStats(s.data); setOrders(o.data.orders.slice(0, 5)); })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [isSeller]);

  const becomeSeller = async () => {
    try { await api.put("/users/become-seller"); await refreshUser(); window.location.reload(); }
    catch (e) { setError(errMsg(e)); }
  };

  if (loading) return <Spinner full />;

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-bold">Hi {user.name.split(" ")[0]} 👋</h1>
      <p className="text-gray-500 mt-1">{isSeller ? "Here is how your selling is going." : "Here is a summary of your orders."}</p>
      {error && <div className="alert-error mt-4">{error}</div>}

      {isSeller && stats?.seller && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Stat label="Earnings (net)" value={inr(stats.seller.earnings)} sub={`After ${stats.seller.feePercent}% Liverr fee`} />
            <Stat label="Pending earnings" value={inr(stats.seller.pendingEarnings)} sub="From active orders" />
            <Stat label="Active orders" value={stats.seller.activeOrders} sub={`${stats.seller.completedOrders} completed`} />
            <Stat label="Seller level" value={stats.seller.level} sub={`Rating ${stats.seller.rating || "n/a"} (${stats.seller.reviewCount})`} />
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link to="/gigs/new" className="btn-primary">+ Create gig</Link>
            <Link to="/my-gigs" className="btn-secondary">My gigs ({stats.seller.gigs})</Link>
            <Link to="/orders" className="btn-secondary">Manage orders</Link>
          </div>
        </>
      )}

      {!isSeller && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Stat label="Total orders" value={stats?.buyer.totalOrders ?? 0} />
            <Stat label="Active orders" value={stats?.buyer.activeOrders ?? 0} />
            <Stat label="Completed" value={stats?.buyer.completedOrders ?? 0} />
            <Stat label="Total spent" value={inr(stats?.buyer.totalSpent)} />
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link to="/gigs" className="btn-primary">Browse gigs</Link>
            <Link to="/orders" className="btn-secondary">My orders</Link>
            <button onClick={becomeSeller} className="btn-secondary">Become a seller</button>
          </div>
        </>
      )}

      <h2 className="text-xl font-bold mt-10 mb-3">Recent orders</h2>
      {orders.length === 0 ? <div className="card p-8 text-center text-gray-500">No orders yet.</div> : (
        <div className="card divide-y divide-gray-100">
          {orders.map((o) => (
            <Link key={o._id} to="/orders" className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50">
              <div className="min-w-0"><div className="font-medium truncate">{o.gigTitle || o.gig?.title}</div>
                <div className="text-xs text-gray-500">{isSeller ? `Buyer: ${o.buyer?.name}` : `Seller: ${o.seller?.name}`} · {dateFmt(o.createdAt)}</div></div>
              <div className="flex items-center gap-3"><span className="font-semibold">{inr(o.price)}</span><span className={`badge ${STATUS[o.status].cls}`}>{STATUS[o.status].label}</span></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
