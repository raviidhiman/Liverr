import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OTPInput from "../components/auth/OTPInput";
import api from "../api/axios";
export default function OTPPage() {
  const { state } = useLocation(); const nav = useNavigate(); const { login } = useAuth();
  const email=state?.email||""; const purpose=state?.purpose||"registration";
  const [err,setErr]=useState(""); const [msg,setMsg]=useState(""); const [loading,setLoading]=useState(false);
  const [timer,setTimer]=useState(60); const [canResend,setCanResend]=useState(false);
  useEffect(()=>{if(!email)nav("/register");},[email]);
  useEffect(()=>{
    if(timer<=0){setCanResend(true);return;}
    const t=setTimeout(()=>setTimer(p=>p-1),1000); return()=>clearTimeout(t);
  },[timer]);
  const verify=useCallback(async otp=>{
    setLoading(true); setErr("");
    try {
      const r=await api.post("/auth/verify-otp",{email,otp,purpose});
      const {verificationToken}=r.data;
      if(purpose==="registration"){
        const pending=JSON.parse(sessionStorage.getItem("pendingReg")||"{}");
        const r2=await api.post("/auth/register",{...pending,verificationToken});
        sessionStorage.removeItem("pendingReg");
        login(r2.data.token,r2.data.user); nav("/dashboard");
      } else { nav("/reset-password",{state:{email,verificationToken}}); }
    } catch(e){setErr(e.response?.data?.message||"Invalid OTP");}
    finally{setLoading(false);}
  },[email,purpose]);
  const resend=async()=>{
    if(!canResend)return; setCanResend(false); setTimer(60); setErr("");
    try{await api.post("/auth/send-otp",{email,purpose});setMsg("New code sent!");setTimeout(()=>setMsg(""),3000);}
    catch(e){setErr(e.response?.data?.message||"Failed to resend");}
  };
  const fmt=t=>`${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;
  return (
    <div style={{minHeight:"calc(100vh - 120px)",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5",padding:24}}>
      <div style={{width:"100%",maxWidth:420,background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:36,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:"#f0fdf8",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28}}>📧</div>
          <h1 style={{fontSize:22,fontWeight:700}}>Check your email</h1>
          <p style={{fontSize:14,color:"#62646a",marginTop:8}}>We sent a 6-digit code to <strong>{email}</strong></p>
        </div>
        {err&&<div className="alert-error" style={{marginBottom:16,textAlign:"center"}}>{err}</div>}
        {msg&&<div className="alert-success" style={{marginBottom:16,textAlign:"center"}}>{msg}</div>}
        <div style={{marginBottom:20}}><OTPInput onComplete={verify} disabled={loading}/></div>
        {loading&&<div style={{display:"flex",justifyContent:"center",marginBottom:16}}><div className="spinner"/></div>}
        <div style={{textAlign:"center",marginTop:16}}>
          {!canResend
            ?<p style={{fontSize:14,color:"#62646a"}}>Resend code in <strong style={{color:"#1dbf73",fontFamily:"monospace"}}>{fmt(timer)}</strong></p>
            :<button onClick={resend} style={{fontSize:14,color:"#1dbf73",fontWeight:600,background:"none",border:"none",cursor:"pointer"}}>Resend OTP</button>
          }
        </div>
        <div style={{textAlign:"center",marginTop:20}}><Link to={purpose==="reset"?"/forgot-password":"/register"} style={{fontSize:13,color:"#95979d",textDecoration:"none"}}>← Go back</Link></div>
      </div>
    </div>
  );
}
