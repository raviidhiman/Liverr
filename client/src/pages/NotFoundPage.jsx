import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return (
    <div className="container py-24 text-center">
      <div className="text-7xl font-extrabold text-brand">404</div>
      <h1 className="text-2xl font-bold mt-3">Page not found</h1>
      <p className="text-gray-500 mt-2">The page you are looking for does not exist or was moved.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
    </div>
  );
}
