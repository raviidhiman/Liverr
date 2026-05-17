import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
export default function RegisterPage() {
  const nav=useNavigate();
  const [form,setForm]=useState({name:"",email:"",password:"",role:"buyer"});
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const submit=async e=>{
    e.preventDefault(); setErr("");
    if(form.password.length<6) return setErr("Password must be at least 6 characters");
    setLoading(true);
    try { await api.post("/auth/send-otp",{email:form.email,purpose:"registration"}); sessionStorage.setItem("pendingReg",JSON.stringify(form)); nav("/verify-otp",{state:{email:form.email,purpose:"registration"}}); }
    catch(e) { setErr(e.response?.data?.message||"Failed to send OTP"); }
    finally { setLoading(false); }
  };
  return (
    <div style={{minHeight:"calc(100vh - 120px)",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5",padding:24}}>
      <div style={{width:"100%",maxWidth:460,background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:36,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:22,fontWeight:800,color:"#222325"}}>freelance<span style={{color:"#1dbf73"}}>hub</span></div>
          <h1 style={{fontSize:22,fontWeight:700,marginTop:16}}>Create a new account</h1>
        </div>
        {err&&<div className="alert-error" style={{marginBottom:16}}>{err}</div>}
        <form onSubmit={submit}>
          <div style={{marginBottom:14}}><label className="field-label">Full Name</label><input className="input" type="text" placeholder="John Doe" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required/></div>
          <div style={{marginBottom:14}}><label className="field-label">Email</label><input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required/></div>
          <div style={{marginBottom:16}}><label className="field-label">Password</label><input className="input" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required/></div>
          <div style={{marginBottom:20}}>
            <label className="field-label">I want to</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
              {[{v:"buyer",l:"Buy Services",e:"🛒"},{v:"seller",l:"Sell Services",e:"💼"}].map(o=>(
                <button key={o.v} type="button" onClick={()=>setForm(p=>({...p,role:o.v}))}
                  style={{padding:"14px 10px",borderRadius:6,border:form.role===o.v?"2px solid #1dbf73":"2px solid #dadbdd",background:form.role===o.v?"#f0fdf8":"#fff",color:form.role===o.v?"#1dbf73":"#62646a",fontWeight:600,fontSize:14,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"all 0.15s",fontFamily:"inherit"}}>
                  <span style={{fontSize:24}}>{o.e}</span>{o.l}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{width:"100%",padding:14,fontSize:15,justifyContent:"center"}}>{loading?"Sending OTP…":"Continue →"}</button>
        </form>
        <p style={{textAlign:"center",fontSize:14,color:"#62646a",marginTop:16}}>Already have an account? <Link to="/login" style={{color:"#1dbf73",fontWeight:600,textDecoration:"none"}}>Sign In</Link></p>
      </div>
    </div>
  );
}
