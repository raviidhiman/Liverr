import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { errMsg } from "../utils/helpers";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const r = await api.post("/auth/login", form);
      login(r.data.token, r.data.user);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) { setError(errMsg(err, "Login failed")); }
    finally { setLoading(false); }
  };

  return (
    <div className="container py-14 flex justify-center">
      <form onSubmit={submit} className="card w-full max-w-md p-8 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Sign in to Liverr</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Enter your details.</p>
        </div>
        {error && <div className="alert-error">{error}</div>}
        <div>
          <label className="field-label">Email</label>
          <input className="input" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input className="input" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <div className="text-right mt-1"><Link to="/forgot-password" className="text-sm text-brand font-semibold">Forgot password?</Link></div>
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        <p className="text-sm text-center text-gray-600">New to Liverr? <Link to="/register" className="text-brand font-semibold">Join now</Link></p>
      </form>
    </div>
  );
}
