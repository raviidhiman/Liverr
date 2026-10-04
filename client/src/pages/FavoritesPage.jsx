import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import GigCard from "../components/gigs/GigCard";
import Spinner from "../components/common/Spinner";
import { useAuth } from "../context/AuthContext";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/favorites/list").then((r) => setGigs(r.data.gigs)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Drop cards immediately when un-hearted
  const visible = gigs.filter((g) => user?.favorites?.some((id) => String(id) === String(g._id)));

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Saved gigs</h1>
      {loading ? <Spinner /> : visible.length === 0 ? (
        <div className="text-center py-16 text-gray-500"><div className="text-5xl mb-2">♡</div>
          <p>You have not saved any gigs yet.</p><Link to="/gigs" className="btn-primary mt-4 inline-flex">Explore gigs</Link></div>
      ) : <div className="gig-grid">{visible.map((g) => <GigCard key={g._id} gig={g} />)}</div>}
    </div>
  );
}
