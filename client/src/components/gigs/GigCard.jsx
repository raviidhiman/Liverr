import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Stars from "../common/Stars";
import Avatar from "../common/Avatar";
import { gradientFor, categoryIcon, inr } from "../../utils/helpers";

export default function GigCard({ gig }) {
  const { user, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const isFav = user?.favorites?.some((id) => String(id) === String(gig._id));
  const basic = gig.packages?.basic;

  const onHeart = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return navigate("/login");
    try { await toggleFavorite(gig._id); } catch { /* ignore */ }
  };

  return (
    <Link to={`/gigs/${gig._id}`} className="card card-hover block">
      <div className="relative h-40 w-full">
        {gig.coverImage
          ? <img src={gig.coverImage} alt={gig.title} className="h-full w-full object-cover" loading="lazy" />
          : <div className="h-full w-full flex items-center justify-center text-5xl" style={{ background: gradientFor(gig.title) }}>{categoryIcon(gig.category)}</div>}
        <button onClick={onHeart} aria-label="Save gig" className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-lg"
          style={{ color: isFav ? "#e0245e" : "#74767e" }}>{isFav ? "♥" : "♡"}</button>
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Avatar user={gig.seller} size={24} />
          <span className="text-sm font-semibold truncate">{gig.seller?.name}</span>
          {gig.seller?.sellerLevel && gig.seller.sellerLevel !== "New Seller" && (
            <span className="text-[11px] text-gray-500 border border-gray-200 rounded px-1.5">{gig.seller.sellerLevel}</span>
          )}
        </div>
        <h3 className="text-[15px] leading-snug line-clamp-2 h-[42px] hover:underline">{gig.title}</h3>
        <div className="mt-2"><Stars rating={gig.rating} count={gig.reviewCount} /></div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
          <span className="text-gray-500 text-xs uppercase tracking-wide">Starting at</span>
          <span className="font-bold text-base">{inr(basic?.price)}</span>
        </div>
      </div>
    </Link>
  );
}
