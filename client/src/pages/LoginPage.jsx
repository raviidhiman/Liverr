import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
export default function LoginPage() {
  const { login } = useAuth(); const nav = useNavigate(); const loc = useLocation();
  const [form, setForm] = useState({ email:"", password:"" });
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async e => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { const r=await api.post("/auth/login",form); login(r.data.token,r.data.user); nav(loc.state?.from||"/dashboard",{replace:true}); }
    catch(e) { setErr(e.response?.data?.message||"Login failed"); }
    finally { setLoading(false); }
  };
  return (
    <div style={{minHeight:"calc(100vh - 120px)",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5",padding:24}}>
      <div style={{width:"100%",maxWidth:440,background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:36,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:22,fontWeight:800,color:"#222325"}}>freelance<span style={{color:"#1dbf73"}}>hub</span></div>
          <h1 style={{fontSize:22,fontWeight:700,marginTop:16,marginBottom:0}}>Sign in to your account</h1>
        </div>
        {err&&<div className="alert-error" style={{marginBottom:16}}>{err}</div>}
        <form onSubmit={submit}>
          <div style={{marginBottom:16}}><label className="field-label">Email</label><input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required/></div>
          <div style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><label className="field-label" style={{margin:0}}>Password</label><Link to="/forgot-password" style={{fontSize:13,color:"#1dbf73",textDecoration:"none"}}>Forgot password?</Link></div>
            <input className="input" type="password" placeholder="Your password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required/>
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{width:"100%",marginTop:20,padding:14,fontSize:15,justifyContent:"center"}}>{loading?"Signing in…":"Continue"}</button>
        </form>
        <p style={{textAlign:"center",fontSize:14,color:"#62646a",marginTop:20}}>Don't have an account? <Link to="/register" style={{color:"#1dbf73",fontWeight:600,textDecoration:"none"}}>Join FreelanceHub</Link></p>
      </div>
    </div>
  );
}
