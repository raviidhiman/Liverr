import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Stars from "../components/common/Stars";
import Spinner from "../components/common/Spinner";
import api from "../api/axios";
export default function GigDetailPage() {
  const { id }=useParams(); const { user }=useAuth(); const nav=useNavigate();
  const [gig,setGig]=useState(null); const [reviews,setReviews]=useState([]); const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("overview"); const [pkg,setPkg]=useState("basic");
  const [reqs,setReqs]=useState(""); const [ordering,setOrdering]=useState(false); const [orderErr,setOrderErr]=useState("");
  useEffect(()=>{
    Promise.all([api.get(`/gigs/${id}`),api.get(`/reviews/gig/${id}`)])
      .then(([g,r])=>{setGig(g.data.gig);setReviews(r.data.reviews||[]);})
      .catch(()=>setGig(null)).finally(()=>setLoading(false));
  },[id]);
  const placeOrder=async()=>{
    if(!user)return nav("/login",{state:{from:`/gigs/${id}`}});
    setOrdering(true);setOrderErr("");
    try{const r=await api.post("/orders",{gigId:id,packageType:pkg,requirements:reqs});nav(`/payment/${r.data.order._id}`);}
    catch(e){setOrderErr(e.response?.data?.message||"Order failed");}
    finally{setOrdering(false);}
  };
  const contactSeller=()=>{if(!user)return nav("/login");nav("/inbox",{state:{recipientId:gig.seller._id,gigId:id}});};
  if(loading)return<Spinner full/>;
  if(!gig)return<div style={{textAlign:"center",padding:60}}>Gig not found. <Link to="/gigs" style={{color:"#1dbf73"}}>Back</Link></div>;
  const curPkg=gig.packages?.[pkg]; const pkgs=["basic","standard","premium"].filter(p=>gig.packages?.[p]?.price); const isSelf=gig.seller?._id===user?._id;
  return (
    <div style={{background:"#fff",minHeight:"calc(100vh - 120px)"}}>
      <div className="container" style={{paddingTop:28,paddingBottom:48}}>
        <p style={{fontSize:13,color:"#95979d",marginBottom:16}}><Link to="/gigs" style={{color:"#95979d",textDecoration:"none"}}>Services</Link> › <Link to={`/gigs?category=${encodeURIComponent(gig.category)}`} style={{color:"#95979d",textDecoration:"none"}}>{gig.category}</Link></p>
        <div style={{display:"flex",gap:32,alignItems:"flex-start",flexWrap:"wrap"}}>
          {/* LEFT */}
          <div style={{flex:"1 1 560px",minWidth:0}}>
            <h1 style={{fontSize:26,fontWeight:700,lineHeight:1.3,marginBottom:16}}>{gig.title}</h1>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,padding:"12px 0",borderBottom:"1px solid #dadbdd"}}>
              <Link to={`/profile/${gig.seller?._id}`} style={{textDecoration:"none"}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:"#1dbf73",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:18}}>{gig.seller?.name?.[0]?.toUpperCase()}</div>
              </Link>
              <div>
                <Link to={`/profile/${gig.seller?._id}`} style={{fontWeight:600,fontSize:15,color:"#222325",textDecoration:"none"}}>{gig.seller?.name}</Link>
                <div style={{display:"flex",alignItems:"center",gap:10,marginTop:2}}>
                  {gig.reviewCount>0&&<Stars rating={gig.rating} count={gig.reviewCount}/>}
                  <span style={{fontSize:13,color:"#95979d"}}>{gig.seller?.sellerLevel}</span>
                  {gig.orderCount>0&&<span style={{fontSize:13,color:"#95979d"}}>{gig.orderCount} orders</span>}
                </div>
              </div>
            </div>
            <div style={{background:"#f5f5f5",borderRadius:8,overflow:"hidden",marginBottom:24,height:360}}>
              {gig.coverImage?<img src={gig.coverImage} alt={gig.title} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:64,color:"#dadbdd"}}>🎨</div>}
            </div>
            <div style={{display:"flex",borderBottom:"2px solid #dadbdd",marginBottom:24}}>
              {[["overview","Overview"],["reviews",`Reviews (${reviews.length})`]].map(([t,l])=>(
                <button key={t} onClick={()=>setTab(t)} style={{padding:"10px 20px",fontSize:14,fontWeight:600,border:"none",background:"none",cursor:"pointer",color:tab===t?"#222325":"#95979d",borderBottom:tab===t?"2px solid #222325":"2px solid transparent",marginBottom:-2,fontFamily:"inherit"}}>
                  {l}
                </button>
              ))}
            </div>
            {tab==="overview"&&(
              <div>
                <h2 style={{fontSize:18,fontWeight:700,marginBottom:12}}>About this gig</h2>
                <p style={{fontSize:14,color:"#404145",lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:20}}>{gig.description}</p>
                {gig.tags?.length>0&&(
                  <div>
                    <h3 style={{fontSize:14,fontWeight:600,marginBottom:10}}>Tags</h3>
                    <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                      {gig.tags.map(t=><Link key={t} to={`/gigs?search=${encodeURIComponent(t)}`} style={{fontSize:12,padding:"5px 12px",border:"1px solid #dadbdd",borderRadius:20,color:"#62646a",textDecoration:"none"}}>{t}</Link>)}
                    </div>
                  </div>
                )}
              </div>
            )}
            {tab==="reviews"&&(
              <div>
                {reviews.length===0?<p style={{color:"#95979d",fontSize:14}}>No reviews yet.</p>:reviews.map(r=>(
                  <div key={r._id} style={{borderBottom:"1px solid #dadbdd",paddingBottom:20,marginBottom:20}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:"#62646a",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14}}>{r.reviewer?.name?.[0]?.toUpperCase()}</div>
                      <div><div style={{fontWeight:600,fontSize:14}}>{r.reviewer?.name}</div><Stars rating={r.rating}/></div>
                      <span style={{fontSize:12,color:"#95979d",marginLeft:"auto"}}>{new Date(r.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
                    </div>
                    <p style={{fontSize:14,color:"#404145",lineHeight:1.6}}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* RIGHT - Order Panel */}
          <div style={{width:340,flexShrink:0,position:"sticky",top:88}}>
            <div style={{border:"1px solid #dadbdd",borderRadius:8,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
              <div style={{display:"flex",borderBottom:"1px solid #dadbdd"}}>
                {pkgs.map(p=>(
                  <button key={p} onClick={()=>setPkg(p)} style={{flex:1,padding:"12px 8px",fontSize:13,fontWeight:600,border:"none",cursor:"pointer",textTransform:"capitalize",background:pkg===p?"#fff":"#f5f5f5",color:pkg===p?"#222325":"#62646a",borderBottom:pkg===p?"2px solid #222325":"none",fontFamily:"inherit"}}>{p}</button>
                ))}
              </div>
              {curPkg&&(
                <div style={{padding:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <span style={{fontWeight:700,fontSize:15}}>{curPkg.title}</span>
                    <span style={{fontWeight:800,fontSize:22}}>${curPkg.price}</span>
                  </div>
                  <p style={{fontSize:13,color:"#62646a",lineHeight:1.6,marginBottom:16}}>{curPkg.description}</p>
                  <div style={{display:"flex",gap:16,marginBottom:16,fontSize:13,color:"#62646a"}}>
                    <span>⏱ {curPkg.deliveryTime}-day delivery</span>
                    <span>🔄 {curPkg.revisions} revisions</span>
                  </div>
                  {curPkg.features?.filter(Boolean).length>0&&(
                    <ul style={{marginBottom:16,paddingLeft:0,listStyle:"none"}}>
                      {curPkg.features.filter(Boolean).map((f,i)=>(
                        <li key={i} style={{display:"flex",gap:8,fontSize:13,color:"#404145",marginBottom:6}}><span style={{color:"#1dbf73",flexShrink:0}}>✓</span>{f}</li>
                      ))}
                    </ul>
                  )}
                  <textarea value={reqs} onChange={e=>setReqs(e.target.value)} rows={3} placeholder="Any requirements for the seller? (optional)"
                    style={{width:"100%",border:"1px solid #dadbdd",borderRadius:4,padding:"10px 12px",fontSize:13,resize:"none",outline:"none",fontFamily:"inherit",marginBottom:14}}/>
                  {orderErr&&<p style={{fontSize:13,color:"#c0392b",marginBottom:10}}>{orderErr}</p>}
                  <button onClick={placeOrder} disabled={ordering||isSelf} className="btn-primary" style={{width:"100%",padding:14,fontSize:15,justifyContent:"center",marginBottom:10}}>
                    {ordering?"Please wait…":isSelf?"Your own gig":`Continue ($${curPkg.price})`}
                  </button>
                  <button onClick={contactSeller} disabled={isSelf}
                    style={{width:"100%",padding:12,fontSize:13,border:"1px solid #dadbdd",borderRadius:4,background:"#fff",cursor:isSelf?"not-allowed":"pointer",color:"#222325",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"inherit"}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    Contact Seller
                  </button>
                </div>
              )}
            </div>
            <div style={{border:"1px solid #dadbdd",borderRadius:8,padding:20,marginTop:16}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{width:48,height:48,borderRadius:"50%",background:"#1dbf73",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:20}}>{gig.seller?.name?.[0]?.toUpperCase()}</div>
                <div>
                  <Link to={`/profile/${gig.seller?._id}`} style={{fontWeight:700,fontSize:14,color:"#222325",textDecoration:"none",display:"block"}}>{gig.seller?.name}</Link>
                  <span style={{fontSize:12,color:"#95979d"}}>{gig.seller?.sellerLevel}</span>
                  {gig.seller?.rating>0&&<div style={{marginTop:2}}><Stars rating={gig.seller.rating} count={gig.seller.reviewCount}/></div>}
                </div>
              </div>
              {gig.seller?.bio&&<p style={{fontSize:13,color:"#62646a",lineHeight:1.5,marginBottom:14}}>{gig.seller.bio.slice(0,140)}{gig.seller.bio.length>140?"…":""}</p>}
              <Link to={`/profile/${gig.seller?._id}`} style={{display:"block",textAlign:"center",border:"1px solid #dadbdd",borderRadius:4,padding:"9px",fontSize:13,color:"#222325",textDecoration:"none",fontWeight:500}}>View Profile</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
