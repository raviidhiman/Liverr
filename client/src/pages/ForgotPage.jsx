import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import OTPInput from "../components/auth/OTPInput";
import { errMsg } from "../utils/helpers";

export default function ForgotPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 email, 2 otp, 3 new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async (fn) => {
    setError(""); setLoading(true);
    try { await fn(); } catch (err) { setError(errMsg(err)); } finally { setLoading(false); }
  };

  const sendCode = (e) => { e?.preventDefault(); run(async () => {
    const r = await api.post("/auth/forgot-password", { email });
    setDevOtp(r.data.devOtp || ""); setStep(2);
  }); };
  const verify = (e) => { e.preventDefault(); run(async () => {
    const r = await api.post("/auth/verify-otp", { email, otp, purpose: "reset" });
    setToken(r.data.verificationToken); setStep(3);
  }); };
  const reset = (e) => { e.preventDefault(); run(async () => {
    await api.post("/auth/reset-password", { email, newPassword: password, verificationToken: token });
    navigate("/login", { replace: true });
  }); };

  return (
    <div className="container py-14 flex justify-center">
      <div className="card w-full max-w-md p-8 space-y-4">
        <h1 className="text-2xl font-bold">Reset password</h1>
        {error && <div className="alert-error">{error}</div>}
        {step === 1 && (
          <form onSubmit={sendCode} className="space-y-4">
            <p className="text-sm text-gray-500">Enter your email and we will send you a verification code.</p>
            <input className="input" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn-primary w-full" disabled={loading}>{loading ? "Sending..." : "Send code"}</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={verify} className="space-y-5">
            <p className="text-sm text-gray-500">Enter the 6-digit code sent to <b>{email}</b>.</p>
            {devOtp && <div className="alert-info"><b>Dev mode:</b> your code is <b className="font-mono text-lg tracking-widest">{devOtp}</b></div>}
            <OTPInput value={otp} onChange={setOtp} />
            <button className="btn-primary w-full" disabled={loading || otp.length !== 6}>{loading ? "Verifying..." : "Verify code"}</button>
            <button type="button" onClick={() => { setOtp(""); sendCode(); }} className="text-sm text-brand font-semibold w-full text-center">Resend code</button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={reset} className="space-y-4">
            <p className="text-sm text-gray-500">Choose a new password.</p>
            <input className="input" type="password" required minLength={6} placeholder="New password (min 6 characters)" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="btn-primary w-full" disabled={loading}>{loading ? "Saving..." : "Reset password"}</button>
          </form>
        )}
        <p className="text-sm text-center"><Link to="/login" className="text-brand font-semibold">← Back to sign in</Link></p>
      </div>
    </div>
  );
}
