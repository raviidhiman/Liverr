import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
const CATS=["Graphics & Design","Digital Marketing","Writing & Translation","Video & Animation","Music & Audio","Programming & Tech","Business","Data","Lifestyle"];
const STEPS=["Basic Info","Packages","Description & Tags"];
const emptyPkg=(title,price,days)=>({title,description:"",deliveryTime:days,revisions:1,price,features:[""]});
export default function CreateGigPage() {
  const nav=useNavigate(); const [step,setStep]=useState(0); const [loading,setLoading]=useState(false); const [err,setErr]=useState("");
  const [form,setForm]=useState({title:"",category:"",coverImage:"",description:"",tags:"",packages:{basic:emptyPkg("Basic",50,3),standard:emptyPkg("Standard",100,5),premium:emptyPkg("Premium",200,10)}});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const updPkg=(tier,k,v)=>setForm(p=>({...p,packages:{...p.packages,[tier]:{...p.packages[tier],[k]:v}}}));
  const updFeat=(tier,i,v)=>{const f=[...form.packages[tier].features];f[i]=v;updPkg(tier,"features",f);};
  const addFeat=tier=>updPkg(tier,"features",[...form.packages[tier].features,""]);
  const delFeat=(tier,i)=>updPkg(tier,"features",form.packages[tier].features.filter((_,j)=>j!==i));
  const submit=async()=>{
    setErr(""); if(!form.title.trim())return setErr("Title is required"); if(!form.category)return setErr("Category is required"); if(!form.description.trim())return setErr("Description is required");
    setLoading(true);
    try{const payload={...form,tags:form.tags.split(",").map(t=>t.trim()).filter(Boolean)};const r=await api.post("/gigs",payload);nav(`/gigs/${r.data.gig._id}`);}
    catch(e){setErr(e.response?.data?.message||"Failed to create gig");}
    finally{setLoading(false);}
  };
  const inp={width:"100%",border:"1px solid #dadbdd",borderRadius:4,padding:"11px 14px",fontSize:14,outline:"none",fontFamily:"inherit",color:"#222325",background:"#fff",boxSizing:"border-box"};
  const lbl={display:"block",fontSize:14,fontWeight:600,color:"#222325",marginBottom:6};
  return (
    <div style={{minHeight:"calc(100vh - 120px)",background:"#f5f5f5",padding:"32px 24px"}}>
      <div style={{maxWidth:760,margin:"0 auto"}}>
        <h1 style={{fontSize:24,fontWeight:700,marginBottom:6,color:"#222325"}}>Create a New Gig</h1>
        <p style={{fontSize:14,color:"#62646a",marginBottom:28}}>Showcase your skills and start earning</p>
        {/* Steps */}
        <div style={{display:"flex",alignItems:"center",marginBottom:28}}>
          {STEPS.map((s,i)=>(
            <div key={s} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,background:i<=step?"#1dbf73":"#dadbdd",color:"#fff",transition:"background 0.2s"}}>{i<step?"✓":i+1}</div>
              </div>
              {i<STEPS.length-1&&<div style={{width:40,height:2,background:i<step?"#1dbf73":"#dadbdd",margin:"0 8px",transition:"background 0.2s"}}/>}
            </div>
          ))}
          <span style={{fontSize:14,fontWeight:600,color:"#222325",marginLeft:12}}>{STEPS[step]}</span>
        </div>
        {err&&<div className="alert-error" style={{marginBottom:20}}>{err}</div>}
        <div style={{background:"#fff",border:"1px solid #dadbdd",borderRadius:8,padding:28}}>
          {step===0&&(
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              <div><label style={lbl}>Gig Title *</label><input style={inp} type="text" maxLength={100} value={form.title} onChange={e=>upd("title",e.target.value)} placeholder="I will design a professional logo for your brand"/><p style={{fontSize:12,color:"#95979d",marginTop:4}}>{form.title.length}/100</p></div>
              <div><label style={lbl}>Category *</label><select style={{...inp,cursor:"pointer"}} value={form.category} onChange={e=>upd("category",e.target.value)}><option value="">Select a category</option>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div><label style={lbl}>Cover Image URL</label><input style={inp} type="url" value={form.coverImage} onChange={e=>upd("coverImage",e.target.value)} placeholder="https://example.com/image.jpg"/></div>
            </div>
          )}
          {step===1&&(
            <div style={{display:"flex",flexDirection:"column",gap:24}}>
              {["basic","standard","premium"].map(tier=>{
                const bg=tier==="basic"?"#f0f7fe":tier==="standard"?"#f5f0fd":"#fff9f0";
                const border=tier==="basic"?"#bfdbfe":tier==="standard"?"#ddd6fe":"#fed7aa";
                const p=form.packages[tier];
                return(
                  <div key={tier} style={{border:`2px solid ${border}`,borderRadius:8,padding:20,background:bg}}>
                    <h3 style={{fontSize:16,fontWeight:700,textTransform:"capitalize",marginBottom:16,color:"#222325"}}>{tier} Package</h3>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <div><label style={lbl}>Title</label><input style={{...inp,background:"#fff"}} value={p.title} onChange={e=>updPkg(tier,"title",e.target.value)}/></div>
                      <div><label style={lbl}>Price ($)</label><input style={{...inp,background:"#fff"}} type="number" min={5} value={p.price} onChange={e=>updPkg(tier,"price",Number(e.target.value))}/></div>
                      <div><label style={lbl}>Delivery (days)</label><input style={{...inp,background:"#fff"}} type="number" min={1} value={p.deliveryTime} onChange={e=>updPkg(tier,"deliveryTime",Number(e.target.value))}/></div>
                      <div><label style={lbl}>Revisions</label><input style={{...inp,background:"#fff"}} type="number" min={0} value={p.revisions} onChange={e=>updPkg(tier,"revisions",Number(e.target.value))}/></div>
                      <div style={{gridColumn:"1/-1"}}><label style={lbl}>Description</label><textarea style={{...inp,resize:"none"}} rows={2} value={p.description} onChange={e=>updPkg(tier,"description",e.target.value)} placeholder={`What's included in ${tier} package?`}/></div>
                      <div style={{gridColumn:"1/-1"}}>
                        <label style={lbl}>Features included</label>
                        {p.features.map((f,i)=>(
                          <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
                            <input style={{...inp,flex:1,background:"#fff"}} value={f} onChange={e=>updFeat(tier,i,e.target.value)} placeholder="e.g. Source file included"/>
                            {p.features.length>1&&<button onClick={()=>delFeat(tier,i)} style={{padding:"0 10px",border:"1px solid #dadbdd",borderRadius:4,background:"#fff",cursor:"pointer",color:"#c0392b",fontSize:16,fontFamily:"inherit"}}>✕</button>}
                          </div>
                        ))}
                        <button onClick={()=>addFeat(tier)} style={{fontSize:13,color:"#1dbf73",fontWeight:600,background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"inherit"}}>+ Add feature</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {step===2&&(
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              <div><label style={lbl}>Description *</label><textarea style={{...inp,resize:"vertical",minHeight:180}} rows={8} maxLength={2000} value={form.description} onChange={e=>upd("description",e.target.value)} placeholder="Describe your gig in detail. What will you deliver? What do you need from buyers?"/><p style={{fontSize:12,color:"#95979d",marginTop:4}}>{form.description.length}/2000</p></div>
              <div><label style={lbl}>Tags (comma-separated)</label><input style={inp} value={form.tags} onChange={e=>upd("tags",e.target.value)} placeholder="logo design, branding, vector, illustrator"/><p style={{fontSize:12,color:"#95979d",marginTop:4}}>Add up to 5 tags</p></div>
              <div style={{background:"#f5f5f5",borderRadius:6,padding:16}}>
                <p style={{fontSize:14,fontWeight:600,marginBottom:10,color:"#222325"}}>Summary</p>
                <p style={{fontSize:13,color:"#62646a"}}><strong>Title:</strong> {form.title||"—"}</p>
                <p style={{fontSize:13,color:"#62646a"}}><strong>Category:</strong> {form.category||"—"}</p>
                <p style={{fontSize:13,color:"#62646a"}}><strong>Starting at:</strong> ${form.packages.basic.price}</p>
              </div>
            </div>
          )}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
          <button onClick={()=>setStep(p=>p-1)} disabled={step===0} style={{padding:"11px 24px",border:"2px solid #dadbdd",borderRadius:4,background:"#fff",cursor:step===0?"not-allowed":"pointer",fontSize:14,fontWeight:600,color:step===0?"#dadbdd":"#222325",fontFamily:"inherit"}}>← Back</button>
          {step<STEPS.length-1
            ?<button onClick={()=>setStep(p=>p+1)} className="btn-primary" style={{padding:"11px 28px"}}>Continue →</button>
            :<button onClick={submit} disabled={loading} className="btn-primary" style={{padding:"11px 28px"}}>{loading?"Publishing…":"🚀 Publish Gig"}</button>
          }
        </div>
      </div>
    </div>
  );
}
