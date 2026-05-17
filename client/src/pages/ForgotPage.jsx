import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
export default function ForgotPage() {
  const nav=useNavigate(); const [email,setEmail]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const submit=async e=>{e.preventDefault();setErr("");setLoading(true);try{await api.post("/auth/forgot-password",{email});nav("/verify-otp",{state:{email,purpose:"reset"}});}catch(e){setErr(e.response?.data?.message||"Failed");}finally{setLoading(false);}};
  return (
    <div style={{minHeight:"calc(100vh - 120px)",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5",padding:24}}>
      <div style={{width:"100%",maxWidth:420,background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:36,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <h1 style={{fontSize:22,fontWeight:700,marginBottom:8}}>Reset password</h1>
        <p style={{fontSize:14,color:"#62646a",marginBottom:24}}>Enter your email and we'll send a verification code.</p>
        {err&&<div className="alert-error" style={{marginBottom:16}}>{err}</div>}
        <form onSubmit={submit}>
          <div style={{marginBottom:16}}><label className="field-label">Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></div>
          <button type="submit" disabled={loading} className="btn-primary" style={{width:"100%",padding:14,justifyContent:"center"}}>{loading?"Sending…":"Send Verification Code"}</button>
        </form>
        <p style={{textAlign:"center",fontSize:14,color:"#62646a",marginTop:20}}><Link to="/login" style={{color:"#1dbf73",fontWeight:600,textDecoration:"none"}}>← Back to Sign In</Link></p>
      </div>
    </div>
  );
}
