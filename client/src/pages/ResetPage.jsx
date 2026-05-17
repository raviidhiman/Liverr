import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
export default function ResetPage() {
  const {state}=useLocation(); const nav=useNavigate();
  const [pw,setPw]=useState(""); const [conf,setConf]=useState(""); const [err,setErr]=useState(""); const [done,setDone]=useState(false); const [loading,setLoading]=useState(false);
  if(!state?.email||!state?.verificationToken) return <div style={{textAlign:"center",padding:60}}>Invalid link. <Link to="/forgot-password" style={{color:"#1dbf73"}}>Try again</Link></div>;
  const submit=async e=>{
    e.preventDefault(); setErr("");
    if(pw!==conf) return setErr("Passwords don't match");
    if(pw.length<6) return setErr("Minimum 6 characters");
    setLoading(true);
    try{await api.post("/auth/reset-password",{email:state.email,newPassword:pw,verificationToken:state.verificationToken});setDone(true);setTimeout(()=>nav("/login"),2500);}
    catch(e){setErr(e.response?.data?.message||"Reset failed");}
    finally{setLoading(false);}
  };
  return (
    <div style={{minHeight:"calc(100vh - 120px)",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5",padding:24}}>
      <div style={{width:"100%",maxWidth:420,background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:36,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        {done?(
          <div style={{textAlign:"center",padding:20}}>
            <div style={{fontSize:48,marginBottom:16}}>✅</div>
            <h2 style={{fontWeight:700}}>Password Updated!</h2>
            <p style={{color:"#62646a",marginTop:8}}>Redirecting to login…</p>
          </div>
        ):(
          <>
            <h1 style={{fontSize:22,fontWeight:700,marginBottom:24}}>Set new password</h1>
            {err&&<div className="alert-error" style={{marginBottom:16}}>{err}</div>}
            <form onSubmit={submit}>
              <div style={{marginBottom:14}}><label className="field-label">New Password</label><input className="input" type="password" value={pw} onChange={e=>setPw(e.target.value)} required/></div>
              <div style={{marginBottom:20}}><label className="field-label">Confirm Password</label><input className="input" type="password" value={conf} onChange={e=>setConf(e.target.value)} required/></div>
              <button type="submit" disabled={loading} className="btn-primary" style={{width:"100%",padding:14,justifyContent:"center"}}>{loading?"Saving…":"Reset Password"}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
