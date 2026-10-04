import { Link } from "react-router-dom";
export default function Logo({ light = false }) {
  return (
    <Link to="/" className={`text-[28px] font-extrabold tracking-tight leading-none ${light ? "text-white" : "text-brand-ink"}`}>
      Liverr<span className="text-brand">.</span>
    </Link>
  );
}
