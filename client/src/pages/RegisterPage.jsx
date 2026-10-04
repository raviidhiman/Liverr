import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import OTPInput from "../components/auth/OTPInput";
import { errMsg } from "../utils/helpers";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "buyer" });
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    const r = await api.post("/auth/send-otp", { email: form.email, purpose: "registration" });
    setDevOtp(r.data.devOtp || "");
    setInfo(r.data.message);
  };

  const submitDetails = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try { await sendOtp(); setStep(2); }
    catch (err) { setError(errMsg(err, "Could not send OTP")); }
    finally { setLoading(false); }
  };

  const verify = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) return setError("Enter the 6-digit code");
    setLoading(true);
    try {
      const v = await api.post("/auth/verify-otp", { email: form.email, otp, purpose: "registration" });
      const r = await api.post("/auth/register", { ...form, verificationToken: v.data.verificationToken });
      login(r.data.token, r.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) { setError(errMsg(err, "Verification failed")); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    setError(""); setOtp("");
    try { await sendOtp(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <div className="container py-14 flex justify-center">
      <div className="card w-full max-w-md p-8">
        {step === 1 ? (
          <form onSubmit={submitDetails} className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">Join Liverr</h1>
              <p className="text-sm text-gray-500 mt-1">Create your account in a minute.</p>
            </div>
            {error && <div className="alert-error">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              {[["buyer", "I want to hire", "Buy services"], ["seller", "I want to work", "Sell services"]].map(([val, title, sub]) => (
                <button type="button" key={val} onClick={() => setForm({ ...form, role: val })}
                  className={`text-left border-2 rounded-lg p-3 ${form.role === val ? "border-brand bg-green-50" : "border-gray-200"}`}>
                  <div className="font-semibold text-sm">{title}</div>
                  <div className="text-xs text-gray-500">{sub}</div>
                </button>
              ))}
            </div>
            <div><label className="field-label">Full name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="field-label">Email</label><input className="input" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="field-label">Password</label><input className="input" type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><p className="field-hint">At least 6 characters</p></div>
            <button className="btn-primary w-full" disabled={loading}>{loading ? "Sending code..." : "Continue"}</button>
            <p className="text-sm text-center text-gray-600">Already a member? <Link to="/login" className="text-brand font-semibold">Sign in</Link></p>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Verify your email</h1>
              <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code for <b>{form.email}</b></p>
            </div>
            {error && <div className="alert-error">{error}</div>}
            {info && !devOtp && <div className="alert-success">{info}</div>}
            {devOtp && <div className="alert-info"><b>Dev mode:</b> no email provider configured. Your code is <b className="font-mono text-lg tracking-widest">{devOtp}</b></div>}
            <OTPInput value={otp} onChange={setOtp} />
            <button className="btn-primary w-full" disabled={loading || otp.length !== 6}>{loading ? "Verifying..." : "Verify & create account"}</button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => { setStep(1); setOtp(""); setError(""); }} className="text-gray-500">← Change details</button>
              <button type="button" onClick={resend} className="text-brand font-semibold">Resend code</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
