import { Link } from "react-router-dom";
import Logo from "./Logo";
import { CATEGORIES } from "../../utils/helpers";

export default function Footer() {
  return (
    <footer className="bg-brand-ink text-gray-300 mt-16">
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-3 text-sm text-gray-400 max-w-sm">Liverr connects businesses with talented freelancers. Find the right service, pay securely, and get great work delivered.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Categories</h4>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.name}><Link className="hover:text-white" to={`/gigs?category=${encodeURIComponent(c.name)}`}>{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Liverr</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/gigs">Explore gigs</Link></li>
            <li><Link className="hover:text-white" to="/register">Become a seller</Link></li>
            <li><Link className="hover:text-white" to="/login">Sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} Liverr. A demo marketplace project.</div>
    </footer>
  );
}
